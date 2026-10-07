process.env.DATABASE_URL = 'postgres://test:test@127.0.0.1:5432/discovery_test';
process.env.JWT_SECRET = 'discovery-test-secret';
delete process.env.GOOGLE_TRANSLATE_API_KEY;
const test = require('node:test'), assert = require('node:assert/strict');
const jwt = require('jsonwebtoken'), express = require('express');
const p = require('../services/offerDiscoveryPolicy');
const f = require('../services/offerDiscoveryFetch');
const { Budget, searchWeb, extractPage } = require('../services/offerDiscoveryProviders');
const { runDiscovery } = require('../services/offerDiscoveryService');
const db = require('../db'), router = require('../routes/offerDiscovery');
const { createOfferRecord, updateOfferRecord } = require('../services/offerCreationService');
const env = {BRAVE_SEARCH_API_KEY:'test-search',OPENAI_API_KEY:'test-ai'};
const config=p.configSchema.parse({maxSearches:1,maxPages:2,maxCostUsd:1});
const now=new Date('2026-10-07T12:00:00Z'), url='https://club.example/jobs/coach';
const evidence='Club Test seeks a football coach. Published 2026-10-06. Apply before 2026-10-20. Applications are open.';
function vacancy(overrides={}) {return {vacancyType:'confirmed',title:'Football Coach',role:'Entrenador',organization:'Club Test',country:'Argentina',city:'Rosario',category:null,modality:null,requirements:null,salary:null,currency:null,benefits:null,publicationDate:'2026-10-06',publicationEvidence:'Published 2026-10-06.',closingDate:'2026-10-20',closingEvidence:'Apply before 2026-10-20.',applicationMethod:null,applicationUrl:null,contact:null,summaryEs:'El Club Test busca un entrenador de futbol para su equipo.',originalSource:true,vacancyEvidence:'Club Test seeks a football coach.',validity:'open',validityEvidence:'Applications are open.',...overrides};}
test('URL normalization, permanent FutbolJobs exclusion and unsafe protocols',()=>{
 assert.equal(p.normalizeUrl('https://CLUB.example/jobs/coach/?utm_source=a&b=2&a=1#apply'),url+'?a=1&b=2');
 assert.ok(p.isExcluded('https://www.futboljobs.com/jobs',[]));assert.ok(p.isExcluded('https://jobs.other.example/a',['other.example']));
 for(const u of ['http://club.example','https://user:pass@club.example','https://club.example:8080']) assert.throws(()=>p.normalizeUrl(u));
});
test('SSRF blocks private, metadata, IPv6, special ranges and mixed DNS answers',async()=>{
 for(const ip of ['127.0.0.1','10.0.0.1','169.254.169.254','172.16.1.1','192.168.1.1','100.64.0.1','::1','::ffff:127.0.0.1','198.18.0.1','0.0.0.0']) assert.equal(f.isPublicIPv4(ip),false,ip);
 assert.ok(f.isPublicIPv4('8.8.8.8'));
 await assert.rejects(f.resolvePublic('club.example',async()=>[{address:'8.8.8.8',family:4},{address:'10.0.0.1',family:4}]),/UNSAFE_URL/);
});
test('robots restrictions, allow exceptions and executable script stripping',()=>{
 assert.equal(f.robotsAllowed('User-agent: *\nDisallow: /jobs','/jobs/1'),false);
 assert.equal(f.robotsAllowed('User-agent: *\nDisallow: /\nAllow: /jobs','/jobs/1'),true);
 assert.equal(f.robotsAllowed('User-agent: FutbolProyectDiscovery\nDisallow: /\nUser-agent: *\nAllow: /','/jobs'),false);
 assert.equal(f.pageText('<script>read secrets</script><p>Coach vacancy</p>').includes('read secrets'),false);
});
test('seven-day publication evidence, nulls, expiry, generic searches and false evidence',()=>{
 const result=p.validateExtracted(vacancy(),evidence,now,config);assert.equal(result.data.salary,null);assert.equal(result.flags.includes('fecha_sin_verificar'),false);
 assert.equal(p.validateExtracted(vacancy({publicationDate:'2026-09-29',publicationEvidence:'Published 2026-09-29.'}),evidence+' Published 2026-09-29.',now,config),null);
 const unknown=p.validateExtracted(vacancy({publicationEvidence:'Indexed yesterday',closingDate:null,validityEvidence:null}),evidence,now,config);
 assert.equal(unknown.data.publicationDate,null);assert.ok(unknown.flags.includes('fecha_sin_verificar'));assert.ok(unknown.flags.includes('vigencia_sin_verificar'));
 assert.ok(p.validateExtracted(vacancy({closingDate:'2026-10-01',closingEvidence:'Deadline 2026-10-01.'}),evidence+' Deadline 2026-10-01.',now,config).flags.includes('vencida'));
 for(const vacancyType of ['general_search','unsolicited','not_relevant']) assert.equal(p.validateExtracted(vacancy({vacancyType}),evidence,now,config),null);
 assert.equal(p.validateExtracted(vacancy({vacancyEvidence:'invented quote'}),evidence,now,config),null);
 assert.throws(()=>p.extractionSchema.parse(vacancy({publicationDate:'2026-02-30'})));
});
test('automatic publication fails closed; multilingual search rotates languages',()=>{
 assert.throws(()=>p.configSchema.parse({automaticPublication:true}));
 const queries=p.buildQueries(p.configSchema.parse({sources:['club.example'],maxSearches:3}));
 assert.deepEqual(queries.map(q=>q.language),['es','en','pt']);assert.ok(queries[1].q.includes('coach'));assert.ok(queries.every(q=>q.q.includes('site:club.example')));
});
test('budget includes retries and prevents over-budget provider requests',async()=>{
 const budget=new Budget({...config,maxCostUsd:0.015},env);let calls=0;
 await assert.rejects(searchWeb({q:'football coach',language:'en'},budget,new AbortController().signal,env,async()=>{calls++;return new Response('',{status:503});}),/COST_LIMIT/);
 assert.equal(calls,1);assert.equal(budget.reserved,0.01);
});
test('structured extraction has strict schema, no tools, no store and handles refusals',async()=>{
 let body;const fetchImpl=async(u,o)=>{body=JSON.parse(o.body);return Response.json({status:'completed',output:[{content:[{type:'output_text',text:JSON.stringify(vacancy())}]}]});};
 const result=await extractPage(evidence,url,new Budget({...config,maxCostUsd:2}),new AbortController().signal,env,fetchImpl);
 assert.equal(result.salary,null);assert.equal(body.store,false);assert.equal(body.tools,undefined);assert.equal(body.text.format.strict,true);assert.ok(body.instructions.includes('untrusted data'));
 await assert.rejects(extractPage(evidence,url,new Budget({...config,maxCostUsd:2}),new AbortController().signal,env,async()=>Response.json({status:'completed',output:[{content:[{type:'refusal'}]}]})),/EXTRACTION_REFUSED/);
});
test('shared creation validates legacy fields, translates, stores null salary and uses admin ownership',async()=>{
 const calls=[],client={query:async(sql,params)=>{calls.push({sql,params});return {rows:[{id:56}]};}};
 await assert.rejects(createOfferRecord(client,{titulo:'x',descripcion:'short'},7));assert.equal(calls.length,0);
 assert.equal(await createOfferRecord(client,p.toDraft(vacancy()),7),56);assert.ok(calls[0].sql.includes('INSERT INTO ofertas_laborales'));
 assert.equal(calls[0].params.id_usuario_ofertante,7);assert.equal(calls[0].params.salario,null);assert.equal(calls[0].params.titulo_es,'Football Coach');
});
test('shared legacy update enforces owner or administrator',async()=>{
 const calls=[],client={query:async(sql,params)=>{calls.push({sql,params});return {rows:[{id_usuario_ofertante:5}]};}};
 await assert.rejects(updateOfferRecord(client,56,p.toDraft(vacancy()),7,false),e=>e.status===403);
 await updateOfferRecord(client,56,p.toDraft(vacancy()),7,true);assert.ok(calls.at(-1).sql.includes('UPDATE ofertas_laborales'));
});
function memoryDb(){let locked=false,candidate=null,runCount=0;const calls=[];
 const client={release(){},async query(sql,params={}){calls.push({sql,params});
  if(sql.includes('pg_try_advisory_lock')){const got=!locked;if(got)locked=true;return {rows:[{locked:got}]};}
  if(sql.includes('pg_advisory_unlock')){locked=false;return {rows:[]};}
  if(sql.includes('INSERT INTO offer_discovery_runs'))return {rows:[{id:++runCount}]};
  if(sql.includes('SELECT config'))return {rows:[{config}]};
  if(sql.includes('SELECT * FROM discovered_offers'))return {rows:candidate?[candidate]:[]};
  if(sql.includes('INSERT INTO discovered_offers')){candidate={id:1,normalized_url:params.url,source_url:params.source,identity_key:params.key,source_urls:JSON.parse(params.urls),content_hash:params.hash};return {rows:[{id:1}]};}
  if(sql.includes('UPDATE discovered_offers SET extracted')){candidate.content_hash=params.hash;return {rows:[]};}
  return {rows:[]};
 }};return {getClient:async()=>client,calls,get candidate(){return candidate;}};
}
function fakeProvider(overrides={}){return {queries:()=>[{q:'coach',language:'en'}],search:async()=>[url],open:async u=>({url:u,body:evidence}),text:s=>s,extract:async()=>vacancy({publicationDate:null,closingDate:null,publicationEvidence:null}),...overrides};}
test('repeated and syndicated vacancies deduplicate; published changes become pending',async()=>{
 const store=memoryDb();assert.equal((await runDiscovery(store,7,{env,provider:fakeProvider()})).stats.created,1);
 assert.equal((await runDiscovery(store,7,{env,provider:fakeProvider()})).stats.unchanged,1);
 assert.equal((await runDiscovery(store,7,{env,provider:fakeProvider({search:async()=>['https://academy.example/vacancy']})})).stats.unchanged,1);
 store.candidate.published_offer_id=56;
 assert.equal((await runDiscovery(store,7,{env,provider:fakeProvider({extract:async()=>vacancy({publicationDate:null,closingDate:null,requirements:'UEFA B required'})})})).stats.updated,1);
 const update=store.calls.find(c=>c.sql.includes('UPDATE discovered_offers SET extracted'));assert.ok(update.sql.includes("status='pendiente'"));assert.ok(JSON.parse(update.params.flags).includes('actualizacion_pendiente'));
});
test('concurrent executions refuse second worker and release lock',async()=>{
 const store=memoryDb();let unblock,started;const gate=new Promise(r=>unblock=r),ready=new Promise(r=>started=r);
 const first=runDiscovery(store,7,{env,provider:fakeProvider({search:async()=>{started();await gate;return[url];}})});
 await ready;await assert.rejects(runDiscovery(store,7,{env,provider:fakeProvider()}),e=>e.status===409);unblock();await first;
 assert.ok(store.calls.some(c=>c.sql.includes('pg_advisory_unlock')));
});
test('provider errors are sanitized; missing keys and disabled scheduler do not call providers',async()=>{
 const store=memoryDb(),run=await runDiscovery(store,7,{env,provider:fakeProvider({search:async()=>{throw new Error('secret-key sensitive-body');}})});
 assert.equal(run.status,'failed');assert.deepEqual(run.errors,['DISCOVERY_ERROR']);assert.equal(JSON.stringify(store.calls).includes('secret-key'),false);
 await assert.rejects(runDiscovery(store,7,{env:{},provider:fakeProvider()}),e=>e.status===503);
 assert.deepEqual(await runDiscovery(store,null,{scheduled:true,env:{}}),{disabled:true});
});
async function serverFor(t){const app=express();app.use(express.json());app.use('/admin/discovered-offers',router);
 const server=await new Promise(r=>{const s=app.listen(0,'127.0.0.1',()=>r(s));});t.after(()=>server.close());return `http://127.0.0.1:${server.address().port}/admin/discovered-offers`;
}
const auth={Authorization:`Bearer ${jwt.sign({id:7,isadmin:true},process.env.JWT_SECRET)}`,'Content-Type':'application/json'};
test('all administrator endpoints require token and current database admin permission',async t=>{
 const base=await serverFor(t),orig=db.query;t.after(()=>db.query=orig);
 for(const [method,path]of[['GET','/'],['GET','/runs'],['GET','/config'],['POST','/search'],['PUT','/config'],['PATCH','/1'],['POST','/1/publish'],['POST','/1/discard']]) assert.equal((await fetch(base+path,{method})).status,401);
 db.query=async()=>({rows:[{isadmin:false}]});assert.equal((await fetch(base+'/runs',{headers:auth})).status,403);
});
test('review publication uses shared creation transaction and blocks stale, expired and repeated inserts',async t=>{
 const base=await serverFor(t),oq=db.query,oc=db.getClient;t.after(()=>{db.query=oq;db.getClient=oc;});db.query=async()=>({rows:[{isadmin:true}]});
 const row={id:1,status:'pendiente',draft:p.toDraft(vacancy()),extracted:vacancy({closingDate:null}),source_url:url,consulted_at:now,updated_at:now,version:1,published_offer_id:null};const calls=[];
 db.getClient=async()=>({release(){},async query(sql,params){calls.push({sql,params});if(sql.includes('SELECT * FROM discovered_offers'))return {rows:[row]};if(sql.includes('INSERT INTO ofertas_laborales'))return {rows:[{id:65}]};if(sql.includes("status='publicada'"))row.status='publicada';return{rows:[]};}});
 const publish=body=>fetch(base+'/1/publish',{method:'POST',headers:auth,body:JSON.stringify({confirmReviewed:true,expectedVersion:1,...body})});
 assert.equal((await publish({expectedVersion:0})).status,409);assert.equal(calls.some(c=>c.sql.includes('INSERT INTO ofertas_laborales')),false);
 row.extracted.closingDate='2020-01-01';assert.equal((await publish({})).status,409);row.extracted.closingDate=null;
 assert.equal((await publish({})).status,400);
 assert.equal(calls.some(c=>c.sql.includes('INSERT INTO ofertas_laborales')),false);
 row.draft.contacto_postulacion='jobs@club.example';
 assert.equal((await publish({draft:{titulo:'x',descripcion:'short'}})).status,400);
 const response=await publish({});assert.equal(response.status,200);assert.equal((await response.json()).offerId,65);assert.equal((await publish({})).status,409);
 assert.equal(calls.filter(c=>c.sql.includes('INSERT INTO ofertas_laborales')).length,1);const params=calls.find(c=>c.sql.includes('INSERT INTO ofertas_laborales')).params;
 assert.equal(params.id_usuario_ofertante,7);assert.ok(params.descripcion.includes(url));assert.ok(params.detalles_adicionales.includes('jobs@club.example'));assert.ok(calls.some(c=>c.sql==='COMMIT'));assert.ok(calls.some(c=>c.sql==='ROLLBACK'));
});

test('DNS abort is bounded and different categories/titles are not silently merged',async()=>{
 const controller=new AbortController();
 const pending=f.resolvePublic('club.example',()=>new Promise(()=>{}),controller.signal);
 controller.abort();await assert.rejects(pending,/TIME_LIMIT/);
 assert.notEqual(p.identityKey(vacancy({category:'U17'}),url),p.identityKey(vacancy({category:'U19'}),url));
 assert.notEqual(p.identityKey(vacancy({title:'Head Coach'}),url),p.identityKey(vacancy({title:'Assistant Coach'}),url));
});
test('structured provider rejects incomplete and invalid data',async()=>{
 const signal=new AbortController().signal;
 for(const [response,code] of [[{status:'incomplete',output:[]},'EXTRACTION_INCOMPLETE'],
   [{status:'completed',output:[{content:[{type:'output_text',text:'{"salary":"invented"}'}]}]},'EXTRACTION_INVALID']]) {
   await assert.rejects(extractPage(evidence,url,new Budget({...config,maxCostUsd:2}),signal,env,async()=>Response.json(response)),new RegExp(code));
 }
});

test('imported offers require actionable application contact and preserve it despite editing other details',()=>{
 const {hasApplicationContact,withRequiredApplicationContact}=require('../offerApplicationContact');
 for(const contact of ['jobs@club.example','https://club.example/apply','+54 9 341 555 1234','WhatsApp: +54 9 341 555 1234']) {
  const draft={...p.toDraft(vacancy()),contacto_postulacion:contact,detalles_adicionales:'Requisitos revisados.'};
  const result=withRequiredApplicationContact(draft,vacancy());assert.ok(result.detalles_adicionales.includes(contact));
 }
 for(const contact of ['', 'No informado', 'Contactar al club', '2026-10-07', 'http://localhost/apply', 'https://127.0.0.1/apply']) {
  assert.equal(hasApplicationContact(contact,true),false);
  assert.throws(()=>withRequiredApplicationContact({...p.toDraft(vacancy()),contacto_postulacion:contact},vacancy()),e=>e.status===400);
 }
 const oldDraft=p.toDraft(vacancy());delete oldDraft.contacto_postulacion;
 assert.ok(withRequiredApplicationContact(oldDraft,vacancy({applicationUrl:'https://club.example/apply'})).detalles_adicionales.includes('https://club.example/apply'));
 assert.doesNotThrow(()=>withRequiredApplicationContact({...oldDraft,descripcion:'Enviar CV a jobs@club.example'},vacancy()));
 assert.doesNotThrow(()=>withRequiredApplicationContact({...oldDraft,detalles_adicionales:'WhatsApp: +54 9 341 555 1234'},vacancy()));
 assert.ok(p.validateExtracted(vacancy(),evidence,now,config).flags.includes('contacto_faltante'));
});
