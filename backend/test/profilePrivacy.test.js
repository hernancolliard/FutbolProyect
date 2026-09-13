const test = require("node:test");
const assert = require("node:assert/strict");
const {
  getProfileForRequester,
  redactProfileContact,
} = require("../profilePrivacy");

const profile = {
  id: "42",
  nombre: "Alex",
  email: "alex@example.com",
  telefono: "+54 11 5555 5555",
  whatsapp_url: "https://wa.me/541155555555",
  agente_contacto: "agent@example.com",
  instagram_url: "https://instagram.com/alex",
};

test("redactProfileContact hides only private contact fields", () => {
  const sanitized = redactProfileContact(profile);

  assert.equal(sanitized.email, null);
  assert.equal(sanitized.telefono, null);
  assert.equal(sanitized.whatsapp_url, null);
  assert.equal(sanitized.agente_contacto, null);
  assert.equal(sanitized.nombre, profile.nombre);
  assert.equal(sanitized.instagram_url, profile.instagram_url);
  assert.notEqual(sanitized, profile);
});

test("getProfileForRequester keeps contact for authenticated users", () => {
  assert.equal(getProfileForRequester(profile, { id: 7 }), profile);
});

test("getProfileForRequester redacts contact for anonymous users", () => {
  const sanitized = getProfileForRequester(profile, null);

  assert.equal(sanitized.email, null);
  assert.equal(sanitized.telefono, null);
  assert.equal(sanitized.whatsapp_url, null);
  assert.equal(sanitized.agente_contacto, null);
});
