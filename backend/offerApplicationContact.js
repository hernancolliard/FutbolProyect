const { isIP } = require('node:net');

function hasApplicationContact(value, allowBarePhone = false) {
  if (typeof value !== 'string' || !value.trim()) return false;
  const text = value.trim();
  if (/[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Z0-9](?:[A-Z0-9.-]*[A-Z0-9])?\.[A-Z]{2,}/i.test(text)) return true;
  for (const match of text.matchAll(/https?:\/\/[^\s<>"']+/gi)) {
    try {
      const url = new URL(match[0].replace(/[),.;]+$/, ''));
      const host = url.hostname.toLowerCase();
      if (!url.username && !url.password && !url.port && host.includes('.') &&
        !isIP(host) && !host.startsWith('[') && !/\.(local|internal|localhost|lan|home)$/.test(host)) return true;
    } catch { /* A malformed URL is not a way to apply. */ }
  }
  const validPhone = phone => {
    const digits = phone.replace(/\D/g, '');
    return digits.length >= 7 && digits.length <= 15 && !/^\d{4}-\d{2}-\d{2}$/.test(phone.trim());
  };
  const labelled = /(?:tel(?:efono|éfono|ephone)?|phone|whats\s*app|movil|móvil|celular|contacto)\s*[:=]?\s*(\+?[\d(][\d\s().-]{5,25})/gi;
  for (const match of text.matchAll(labelled)) if (validPhone(match[1])) return true;
  return allowBarePhone && /^\+?[\d(][\d\s().-]+$/.test(text) && validPhone(text);
}
function extractedApplicationContact(extracted) {
  return [...new Set([extracted.contact, extracted.applicationUrl,
    hasApplicationContact(extracted.applicationMethod) ? extracted.applicationMethod : null]
    .filter(value => typeof value === 'string' && value.trim()).map(value => value.trim()))].join('\n');
}
function withRequiredApplicationContact(draft, extracted) {
  // Old saved drafts can still use their extracted contact; a deliberate empty
  // field means the reviewer removed it and must supply another application path.
  const contact = draft.contacto_postulacion !== undefined
    ? draft.contacto_postulacion.trim() : extractedApplicationContact(extracted);
  if (!hasApplicationContact(contact, true) &&
      !hasApplicationContact([draft.descripcion, draft.detalles_adicionales].filter(Boolean).join('\n'))) {
    throw Object.assign(new Error('La oferta necesita un email, telefono/WhatsApp o enlace de postulacion publicado. Completa el contacto antes de publicar.'), {status:400});
  }
  if (!hasApplicationContact(contact, true)) return draft;
  const block = `Postulacion y contacto:\n${contact}`;
  return {...draft, detalles_adicionales: [draft.detalles_adicionales, block]
    .filter(Boolean).filter((value, index) => index === 0 || !draft.detalles_adicionales?.includes(block)).join('\n\n')};
}
module.exports = { hasApplicationContact, extractedApplicationContact, withRequiredApplicationContact };
