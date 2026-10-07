const { z } = require('zod');
const { createHash } = require('node:crypto');
const { hasApplicationContact, extractedApplicationContact } = require('../offerApplicationContact');
const text = z.string().max(6000).nullable();
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(s => {
  const d = new Date(s); return Number.isFinite(+d) && d.toISOString().slice(0,10) === s;
}).nullable();
const domain = z.string().toLowerCase().regex(/^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,63}$/);
const configSchema = z.object({
  countries: z.array(z.string().min(2).max(80)).max(20).default([]),
  roles: z.array(z.string().min(3).max(100)).min(1).max(20).default(['jugador','entrenador','scout','ojeador','videoanalista','analista de datos']),
  languages: z.array(z.enum(['es','en','pt','fr','de','it'])).min(1).max(6).default(['es','en','pt']),
  sources: z.array(domain).max(40).default([]),
  excludedDomains: z.array(domain).max(40).default(['futboljobs.com']),
  maxAgeDays: z.number().int().min(1).max(90).default(7),
  maxSearches: z.number().int().min(1).max(30).default(6),
  maxPages: z.number().int().min(1).max(40).default(10),
  maxSeconds: z.number().int().min(15).max(600).default(180),
  maxCostUsd: z.number().positive().max(10).default(0.5),
  automaticPublication: z.literal(false).default(false),
  approvedSources: z.array(domain).max(40).default([]),
  // Reserved fail-closed policy for a later automatic publisher.
  automaticRules: z.object({ requireVerifiedDates: z.literal(true), requireNoFlags: z.literal(true) })
    .default({ requireVerifiedDates: true, requireNoFlags: true }),
}).strict();
const extractionSchema = z.object({
  vacancyType: z.enum(['confirmed','general_search','unsolicited','not_relevant']),
  title: text, role: text, organization: text, country: text, city: text,
  category: text, modality: text, requirements: text,
  salary: z.number().positive().nullable(), currency: z.string().max(10).nullable(), benefits: text,
  publicationDate: date, publicationEvidence: text, closingDate: date, closingEvidence: text,
  applicationMethod: text, applicationUrl: z.string().max(2000).nullable(), contact: text,
  summaryEs: z.string().max(6000), originalSource: z.boolean(),
  vacancyEvidence: text, validity: z.enum(['open','closed','unknown']), validityEvidence: text,
}).strict();
const editSchema = z.object({
  contacto_postulacion: z.string().max(14000).optional(),
  titulo: z.string().max(100), descripcion: z.string().max(15000),
  puesto: z.string().max(100).optional(), ubicacion: z.string().max(100).optional(),
  salario: z.number().positive().nullable().optional(), horarios: z.string().max(100).optional(),
  nivel: z.string().max(50).optional(), detalles_adicionales: z.string().max(10000).optional(),
}).strict();
function normalizeUrl(value) {
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.username || url.password || (url.port && url.port !== '443')) throw new Error('UNSAFE_URL');
  url.hash = ''; url.hostname = url.hostname.toLowerCase().replace(/\.$/,'');
  for (const key of [...url.searchParams.keys()]) if (/^(utm_|fbclid$|gclid$|ref$)/i.test(key)) url.searchParams.delete(key);
  url.searchParams.sort();
  url.pathname = url.pathname.replace(/\/+$/, '') || '/';
  return url.href;
}
function matchesDomain(host, domain) { return host === domain || host.endsWith(`.${domain}`); }
function isExcluded(url, domains = []) {
  const host = new URL(url).hostname.toLowerCase();
  return ['futboljobs.com','futboljobs.es','futboljobs.net',...domains].some(d => matchesDomain(host,d));
}
function normalizeText(value) {
  return (value || '').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
}
function hash(value) { return createHash('sha256').update(JSON.stringify(value)).digest('hex'); }
function identityKey(data, url) {
  // Unknown identity must never merge unrelated offers.
  return data.organization && data.role && (data.country || data.city)
    ? hash([data.organization,data.role,data.country,data.city,data.category,data.title].map(normalizeText)) : hash(url);
}
function verifiedEvidence(quote, content) {
  return typeof quote === 'string' && quote.trim().length >= 6 && content.includes(quote.trim());
}
function validateExtracted(raw, content, now, config) {
  const data = extractionSchema.parse(raw);
  if (data.vacancyType !== 'confirmed' || !verifiedEvidence(data.vacancyEvidence,content)) return null;
  const flags = [];
  for (const prefix of ['publication','closing']) {
    const key = `${prefix}Date`, evidence = `${prefix}Evidence`;
    // Dates must appear literally in the quoted source; ambiguous formats stay unknown.
    if (data[key] && (!verifiedEvidence(data[evidence],content) || !data[evidence].includes(data[key]))) {
      data[key] = null; if (!verifiedEvidence(data[evidence],content)) data[evidence] = null;
    }
  }
  const today = now.toISOString().slice(0,10);
  if (data.publicationDate && data.publicationDate > today) { data.publicationDate = null; data.publicationEvidence = null; }
  if (data.publicationDate && +new Date(today) - +new Date(data.publicationDate) > config.maxAgeDays * 86400000) return null;
  if (!data.publicationDate) flags.push('fecha_sin_verificar');
  if (!verifiedEvidence(data.validityEvidence,content)) data.validity = 'unknown';
  if (data.validity === 'closed' || (data.closingDate && data.closingDate < today)) flags.push('vencida');
  else if (data.validity !== 'open' && !data.closingDate) flags.push('vigencia_sin_verificar');
  if (!data.originalSource) flags.push('fuente_original_sin_verificar');
  // Every machine extraction needs human verification, even with literal evidence.
  flags.push('datos_extraidos_por_ia');
  if (!hasApplicationContact(extractedApplicationContact(data), true)) flags.push('contacto_faltante');
  return { data, flags };
}
function toDraft(data) {
  return {
    contacto_postulacion: extractedApplicationContact(data),
    titulo: (data.title || '').slice(0,100), descripcion: data.summaryEs || '',
    puesto: (data.role || '').slice(0,100), ubicacion: [data.city,data.country].filter(Boolean).join(', ').slice(0,100),
    // Keep currency and salary in extracted data; the existing numeric field has no currency column.
    salario: null, nivel: (data.category || '').slice(0,50), horarios: (data.modality || '').slice(0,100),
    detalles_adicionales: [data.requirements,data.benefits,data.applicationMethod,data.applicationUrl,data.contact].filter(Boolean).join('\n'),
  };
}
const terms = {
 es: 'futbol vacante empleo contratacion', en: 'football soccer vacancy hiring job',
 pt: 'futebol vaga emprego contratacao', fr: 'football recrutement poste emploi',
 de: 'Fussball Stellenangebot Trainer Spieler', it: 'calcio lavoro posizione allenatore giocatore',
};
function buildQueries(config) {
  // Round robin across languages, roles, countries and original sources within the hard limit.
  return Array.from({length:config.maxSearches}, (_,i) => {
    const language = config.languages[i % config.languages.length];
    const roleName = config.roles[i % config.roles.length];
    const translations = {jugador:{en:'player',pt:'jogador',fr:'joueur',de:'Spieler',it:'giocatore'},entrenador:{en:'coach',pt:'treinador',fr:'entraineur',de:'Trainer',it:'allenatore'},ojeador:{en:'scout',pt:'olheiro'},videoanalista:{en:'video analyst',pt:'analista de video'},'analista de datos':{en:'data analyst',pt:'analista de dados'}};
    const role = translations[normalizeText(roleName)]?.[language] || roleName;
    const country = config.countries.length ? config.countries[i % config.countries.length] : '';
    const source = config.sources.length ? `site:${config.sources[i % config.sources.length]}` : '(club academy federation agency)';
    return { language, q: `${terms[language]} ${role} ${country} ${source} -site:futboljobs.com`.trim() };
  });
}
module.exports = { configSchema, extractionSchema, editSchema, normalizeUrl, isExcluded, matchesDomain,
 normalizeText, identityKey, hash, verifiedEvidence, validateExtracted, toDraft, buildQueries };
