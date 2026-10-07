const express = require('express');
const db = require('../services/offerDiscoveryDb');
const { verificarToken, verificarAdmin } = require('../middleware/authMiddleware');
const { configSchema, editSchema } = require('../services/offerDiscoveryPolicy');
const { readConfig, runDiscovery } = require('../services/offerDiscoveryService');
const { createOfferRecord, updateOfferRecord } = require('../services/offerCreationService');
const { offerSchema } = require('../offerSchema');
const { hasApplicationContact, withRequiredApplicationContact } = require('../offerApplicationContact');
const router = express.Router();
router.use(verificarToken,verificarAdmin);
const asyncRoute = fn => (req,res) => Promise.resolve(fn(req,res)).catch(error => {
  if(res.headersSent) return; // Background errors have already been recorded in run history.
  if(error.name === 'ZodError') return res.status(400).json({message:'Datos invalidos. Completa los campos requeridos.',errors:error.flatten().fieldErrors});
  const status = error.status || (error.code === '42P01' ? 503 : 500);
  res.status(status).json({message:error.status ? error.message : error.code === '42P01'
    ? 'Aplicar create_offer_discovery.sql antes de usar la bandeja.' : 'No se pudo completar la operacion.'});
});
router.get('/config',asyncRoute(async (req,res) => {
  res.json({ config:await readConfig(db), ready:Boolean(process.env.BRAVE_SEARCH_API_KEY && process.env.OPENAI_API_KEY),
    scheduleEnabled:process.env.DISCOVERY_SCHEDULE_ENABLED === 'true', automaticPublication:false });
}));
router.put('/config',asyncRoute(async (req,res) => {
  const config = configSchema.parse(req.body);
  await db.query(`INSERT INTO offer_discovery_settings(id,config) VALUES (1,@config)
    ON CONFLICT (id) DO UPDATE SET config=EXCLUDED.config,updated_at=NOW()`,{config:JSON.stringify(config)});
  res.json(config);
}));
router.post('/search',asyncRoute(async (req,res) => {
  // Return after durable run creation, so HTTP/proxy timeouts cannot repeat a search.
  await runDiscovery(db,req.user.id,{onStarted:runId => res.status(202).json({runId,status:'running'})});
}));
router.get('/runs',asyncRoute(async (req,res) => {
  const result = await db.query('SELECT * FROM offer_discovery_runs ORDER BY id DESC LIMIT 30');
  res.json(result.rows);
}));
router.get('/',asyncRoute(async (req,res) => {
  const status = ['pendiente','publicada','descartada'].includes(req.query.status) ? req.query.status : null;
  const flag = ['posible_duplicado','vencida','fecha_sin_verificar','vigencia_sin_verificar','actualizacion_pendiente','contacto_faltante'].includes(req.query.flag) ? req.query.flag : null;
  const page = Math.max(1,Math.min(10000,parseInt(req.query.page,10)||1));
  const query = String(req.query.q||'').slice(0,100);
  const params = {status,flag,q:`%${query}%`,offset:(page-1)*30};
  const where = `(@status::text IS NULL OR status=@status) AND (@flag::text IS NULL OR flags ? @flag OR (@flag='vencida' AND extracted->>'closingDate' < to_char(NOW() AT TIME ZONE 'UTC','YYYY-MM-DD')))
    AND (draft->>'titulo' ILIKE @q OR extracted->>'organization' ILIKE @q)`;
  const result = await db.query(`SELECT *,COUNT(*) OVER() AS total FROM discovered_offers
    WHERE ${where} ORDER BY updated_at DESC,id DESC OFFSET @offset LIMIT 30`,params);
  const today = new Date().toISOString().slice(0,10);
  const items = result.rows.map(row => ({...row, flags:[...new Set([...row.flags, ...(row.extracted.closingDate && row.extracted.closingDate < today ? ['vencida'] : [])])]}));
  res.json({items,page,total:Number(result.rows[0]?.total||0)});
}));
router.patch('/:id',asyncRoute(async (req,res) => {
  const draft = editSchema.parse(req.body.draft);
  if(!req.body.expectedVersion) return res.status(400).json({message:"Falta la version revisada."});
  const hasContact = hasApplicationContact(draft.contacto_postulacion, true) || hasApplicationContact([draft.descripcion,draft.detalles_adicionales].filter(Boolean).join('\n'));
  const result = await db.query(`UPDATE discovered_offers SET draft=@draft,updated_at=NOW(),version=version+1,
    flags=CASE WHEN @hasContact THEN flags - 'contacto_faltante' WHEN flags ? 'contacto_faltante' THEN flags ELSE flags || '["contacto_faltante"]'::jsonb END
    WHERE id=@id AND status='pendiente' AND version=@version RETURNING id,version`,{draft:JSON.stringify(draft),hasContact,id:req.params.id,version:req.body.expectedVersion});
  if(!result.rows.length) return res.status(409).json({message:'La oferta ya no esta pendiente.'});
  res.json({saved:true,version:result.rows[0].version});
}));
router.post('/:id/discard',asyncRoute(async (req,res) => {
  const result = await db.query(`UPDATE discovered_offers SET status='descartada',reviewed_by=@user,
    reviewed_at=NOW(),updated_at=NOW(),version=version+1 WHERE id=@id AND status='pendiente' AND version=@version RETURNING id`,{user:req.user.id,id:req.params.id,version:req.body.expectedVersion || null});
  if(!result.rows.length) return res.status(409).json({message:'La oferta ya no esta pendiente.'});
  res.json({discarded:true});
}));
router.post('/:id/publish',asyncRoute(async (req,res) => {
  if(req.body.confirmReviewed !== true) return res.status(400).json({message:'Confirma la revision de datos, fuente, vigencia y duplicados.'});
  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    const row = (await client.query('SELECT * FROM discovered_offers WHERE id=@id FOR UPDATE',{id:req.params.id})).rows[0];
    if(!row) throw Object.assign(new Error('Oferta no encontrada.'),{status:404});
    if(row.status !== 'pendiente') throw Object.assign(new Error('La oferta ya no esta pendiente.'),{status:409});
    if(!req.body.expectedVersion || row.version !== req.body.expectedVersion)
      throw Object.assign(new Error('La oferta cambio. Actualiza la bandeja y revisa de nuevo.'),{status:409});
    const today = new Date().toISOString().slice(0,10);
    if(row.extracted.validity === 'closed' || (row.extracted.closingDate && row.extracted.closingDate < today))
      throw Object.assign(new Error('La oferta esta vencida. Descarta o vuelve a comprobar la fuente.'),{status:409});
    const draft = editSchema.parse(req.body.draft || row.draft);
    const publishable = withRequiredApplicationContact(draft, row.extracted);
    const data = offerSchema.parse(publishable);
    data.descripcion += `\n\nOrganizacion: ${row.extracted.organization || 'No informado'}.\nOferta externa revisada por FutbolProyect; publicada por el administrador.\nFuente: ${row.source_url}\nConsultada: ${new Date(row.consulted_at).toISOString()}`;
    if(!req.body.salaryConfirmed && data.salario)
      throw Object.assign(new Error('Confirma el importe y la moneda; el campo publico de salario no tiene moneda.'),{status:400});
    let offerId = row.published_offer_id;
    if(offerId) await updateOfferRecord(client,offerId,data,req.user.id,true);
    else offerId = await createOfferRecord(client,data,req.user.id);
    await client.query(`UPDATE discovered_offers SET status='publicada',draft=@draft,published_offer_id=@offer,flags=flags - 'contacto_faltante',
      reviewed_by=@user,reviewed_at=NOW(),updated_at=NOW(),version=version+1 WHERE id=@id`,
      {draft:JSON.stringify(draft),offer:offerId,user:req.user.id,id:row.id});
    await client.query('COMMIT');
    require('./offers').invalidateOfferCache();
    // Explicit editorial publication: no subscriber notifications from imported offers.
    res.json({offerId,updated:Boolean(row.published_offer_id)});
  } catch(error) { await client.query('ROLLBACK'); throw error; }
  finally { client.release(); }
}));
module.exports = router;
