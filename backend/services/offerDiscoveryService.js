const { configSchema, normalizeUrl, isExcluded, identityKey, hash, validateExtracted, toDraft, normalizeText } = require('./offerDiscoveryPolicy');
const { hasApplicationContact, extractedApplicationContact } = require('../offerApplicationContact');
const { Budget, realProvider } = require('./offerDiscoveryProviders');
const LOCK_ID = 734182910;
const safeCodes = new Set(['COST_LIMIT','UNSAFE_URL','EXCLUDED_DOMAIN','SOURCE_NOT_APPROVED','ROBOTS_RESTRICTED','SOURCE_UNAVAILABLE','SOURCE_TIMEOUT','PAGE_TOO_LARGE','ACCESS_RESTRICTED','REDIRECT_LIMIT','PROVIDER_UNAVAILABLE','PROVIDER_INVALID_JSON','PROVIDER_TOO_LARGE','EXTRACTION_INCOMPLETE','EXTRACTION_REFUSED','EXTRACTION_INVALID','TIME_LIMIT']);
function safeError(error) {
  return safeCodes.has(error.message) || /^PROVIDER_HTTP_\d+$/.test(error.message) ? error.message : 'DISCOVERY_ERROR';
}
async function readConfig(client) {
  const result = await client.query('SELECT config FROM offer_discovery_settings WHERE id = 1');
  return configSchema.parse(result.rows[0]?.config || {});
}
async function findExistingOffers(client, data, url) {
  // The legacy table has no original-source/organization columns. Search title,
  // attribution in description and role/location; flag broader matches for review.
  const result = await client.query(`SELECT o.id, o.titulo, o.puesto, o.ubicacion, u.nombre
    FROM ofertas_laborales o JOIN usuarios u ON u.id = o.id_usuario_ofertante
    WHERE o.titulo ILIKE @title OR o.descripcion ILIKE @source
       OR (o.puesto ILIKE @role AND o.ubicacion ILIKE @location)
    LIMIT 100`, {
      title:data.title || '\u0001', source:`%${url}%`,
      role:data.role ? `%${data.role}%` : '\u0001', location:(data.city || data.country) ? `%${data.city || data.country}%` : '\u0001',
    });
  return result.rows.map(row => row.id);
}
async function saveCandidate(client, runId, result, pageUrl, now, config) {
  const url = normalizeUrl(pageUrl);
  const { data } = result;
  const key = identityKey(data,url);
  const stable = {...data}; delete stable.summaryEs; delete stable.publicationEvidence;
  delete stable.closingEvidence; delete stable.validityEvidence; delete stable.vacancyEvidence;
  const contentHash = hash(stable);
  const duplicateIds = await findExistingOffers(client,data,url);
  const prior = await client.query('SELECT * FROM discovered_offers WHERE normalized_url = @url OR identity_key = @key OR source_urls ? @url FOR UPDATE',{url,key});
  const row = prior.rows.find(r => r.normalized_url === url) || prior.rows[0];
  const otherCandidates = await client.query(`SELECT id FROM discovered_offers
    WHERE identity_key <> @key AND lower(extracted->>'organization') = lower(@org)
      AND lower(extracted->>'role') = lower(@role) LIMIT 20`, {key,org:data.organization,role:data.role});
  const flags = result.flags.filter(flag => flag !== 'contacto_faltante');
  if (!hasApplicationContact(extractedApplicationContact(data), true)) flags.push('contacto_faltante');
  if(duplicateIds.filter(id => id !== row?.published_offer_id).length || otherCandidates.rows.length || prior.rows.length > 1) flags.push('posible_duplicado');
  if(row && row.source_url !== url) flags.push('varias_fuentes');
  const urls = [...new Set([...(row?.source_urls || []),url])].slice(0,40);
  const params = {url,key,source:url,urls:JSON.stringify(urls),at:now,
    extracted:JSON.stringify(data),hash:contentHash,draft:JSON.stringify(toDraft(data)),flags:JSON.stringify(flags),
    duplicates:JSON.stringify(duplicateIds),runId};
  if(row) {
    if(row.content_hash === contentHash) {
      await client.query('UPDATE discovered_offers SET consulted_at=@at, source_urls=@urls WHERE id=@id',{at:now,urls:params.urls,id:row.id});
      return 'unchanged';
    }
    if(row.published_offer_id) flags.push('actualizacion_pendiente');
    await client.query(`UPDATE discovered_offers SET extracted=@extracted,content_hash=@hash,draft=@draft,
      flags=@flags,possible_duplicate_ids=@duplicates,status='pendiente',consulted_at=@at,source_url=@source,identity_key=@storedKey,version=version+1,
      source_urls=@urls,run_id=@runId,updated_at=NOW(),reviewed_at=NULL WHERE id=@id`,
      {...params,storedKey:prior.rows.length === 1 ? key : row.identity_key,flags:JSON.stringify(flags),id:row.id});
    return 'updated';
  }
  // Unique indexes are the final protection if a worker loses its advisory lock.
  const inserted = await client.query(`INSERT INTO discovered_offers
    (normalized_url,identity_key,source_url,source_urls,consulted_at,extracted,content_hash,draft,flags,possible_duplicate_ids,run_id)
    VALUES (@url,@key,@source,@urls,@at,@extracted,@hash,@draft,@flags,@duplicates,@runId)
    ON CONFLICT DO NOTHING RETURNING id`,params);
  return inserted.rows.length ? 'created' : 'unchanged';
}
async function runDiscovery(db, userId = null, {provider = realProvider, env = process.env, scheduled = false, onStarted} = {}) {
  if(scheduled && env.DISCOVERY_SCHEDULE_ENABLED !== 'true') return {disabled:true};
  if(!env.BRAVE_SEARCH_API_KEY || !env.OPENAI_API_KEY) {
    const error = new Error('Configurar BRAVE_SEARCH_API_KEY y OPENAI_API_KEY en el servidor.'); error.status=503; throw error;
  }
  const client = await db.getClient(); let locked = false, runId;
  const stats = {searches:0,pages:0,created:0,updated:0,unchanged:0,skipped:0,reservedCostUsd:0};
  const errors = []; let controller, timer;
  try {
    const lock = await client.query('SELECT pg_try_advisory_lock(@id) AS locked',{id:LOCK_ID});
    locked = lock.rows[0].locked;
    if(!locked) { const error = new Error('Ya hay una busqueda en ejecucion.'); error.status=409; throw error; }
    // A dead process releases the session lock; annotate its interrupted history.
    await client.query(`UPDATE offer_discovery_runs SET status='failed',finished_at=NOW(),errors='["INTERRUPTED"]'
      WHERE status='running'`);
    const config = await readConfig(client), budget = new Budget(config,env);
    controller = new AbortController(); timer = setTimeout(() => controller.abort(new Error('TIME_LIMIT')),config.maxSeconds*1000);
    runId = (await client.query(`INSERT INTO offer_discovery_runs(status,initiated_by) VALUES ('running',@userId) RETURNING id`,{userId})).rows[0].id;
    onStarted?.(runId);
    const urls = new Set();
    for(const query of provider.queries(config)) {
      if(controller.signal.aborted || stats.pages >= config.maxPages) break;
      let links;
      try { stats.searches++; links = await provider.search(query,budget,controller.signal,env); }
      catch(error) { errors.push(safeError(error)); if(error.message === 'COST_LIMIT') break; continue; }
      for(const link of links) {
        if(controller.signal.aborted || stats.pages >= config.maxPages) break;
        let url;
        try { url = normalizeUrl(link); if(isExcluded(url,config.excludedDomains) || urls.has(url)) {stats.skipped++;continue;} }
        catch { stats.skipped++;continue; }
        urls.add(url); stats.pages++;
        try {
          const page = await provider.open(url,config,controller.signal), content = provider.text(page.body);
          const raw = await provider.extract(content,page.url,budget,controller.signal,env);
          const now = new Date(), result = validateExtracted(raw,content,now,config);
          if(!result || !result.data.originalSource) {stats.skipped++;continue;}
          if(result.data.applicationUrl) {
            try {
              const applicationUrl = normalizeUrl(new URL(result.data.applicationUrl,page.url).href);
              const { resolvePublic } = require('./offerDiscoveryFetch');
              if(isExcluded(applicationUrl,config.excludedDomains)) throw new Error('UNSAFE_URL');
              await resolvePublic(new URL(applicationUrl).hostname, undefined, AbortSignal.any([controller.signal,AbortSignal.timeout(5000)]));
              result.data.applicationUrl = applicationUrl;
            } catch { result.data.applicationUrl=null; result.flags.push('postulacion_sin_verificar'); }
          }
          if(result.data.country && config.countries.length && !config.countries.some(c => normalizeText(c) === normalizeText(result.data.country))) {stats.skipped++;continue;}
          await client.query('BEGIN');
          try { stats[await saveCandidate(client,runId,result,page.url,now,config)]++; await client.query('COMMIT'); }
          catch(error) { await client.query('ROLLBACK'); throw error; }
        } catch(error) {
          errors.push(safeError(error));
          if(error.message === 'COST_LIMIT') {controller.abort();break;}
        }
        stats.reservedCostUsd = Number(budget.reserved.toFixed(6));
        // Persist counters after every candidate to preserve useful crash history.
        await client.query('UPDATE offer_discovery_runs SET stats=@stats,errors=@errors WHERE id=@id',
          {stats:JSON.stringify(stats),errors:JSON.stringify(errors.slice(0,80)),id:runId});
      }
    }
    stats.reservedCostUsd = Number(budget.reserved.toFixed(6));
    if(controller.signal.aborted && !errors.includes('COST_LIMIT')) errors.push('TIME_LIMIT');
    const status = errors.length ? (stats.created+stats.updated+stats.unchanged ? 'partial':'failed') : 'completed';
    await client.query('UPDATE offer_discovery_runs SET status=@status,finished_at=NOW(),stats=@stats,errors=@errors WHERE id=@id',
      {status,stats:JSON.stringify(stats),errors:JSON.stringify(errors.slice(0,80)),id:runId});
    return {runId,status,stats,errors};
  } catch(error) {
    if(runId) await client.query("UPDATE offer_discovery_runs SET status='failed',finished_at=NOW(),errors=@errors WHERE id=@id",
      {errors:JSON.stringify([safeError(error)]),id:runId});
    throw error;
  } finally {
    clearTimeout(timer);
    try { if(locked) await client.query('SELECT pg_advisory_unlock(@id)',{id:LOCK_ID}); }
    finally { client.release(); }
  }
}
module.exports = { readConfig, findExistingOffers, saveCandidate, runDiscovery, safeError, LOCK_ID };
