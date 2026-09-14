const test = require("node:test");
const assert = require("node:assert/strict");
const {
  getProfileAge,
  getProfileForRequester,
  protectProfileBirthDate,
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
  fecha_de_nacimiento: "2010-09-15",
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

test("getProfileAge calculates age without exposing the birth date", () => {
  assert.equal(
    getProfileAge(profile.fecha_de_nacimiento, new Date("2026-09-14T12:00:00Z")),
    15,
  );
});

test("protectProfileBirthDate exposes age and hides the exact date", () => {
  const sanitized = protectProfileBirthDate(profile);
  const expectedAge = getProfileAge(profile.fecha_de_nacimiento);

  assert.equal(sanitized.fecha_de_nacimiento, null);
  assert.equal(sanitized.edad, expectedAge);
  assert.equal(sanitized.es_menor, expectedAge < 18);
});

test("getProfileForRequester keeps contact but hides birth date for authenticated visitors", () => {
  const sanitized = getProfileForRequester(profile, { id: 7 });

  assert.equal(sanitized.email, profile.email);
  assert.equal(sanitized.telefono, profile.telefono);
  assert.equal(sanitized.fecha_de_nacimiento, null);
  assert.equal(sanitized.edad, getProfileAge(profile.fecha_de_nacimiento));
});

test("getProfileForRequester keeps the birth date for its owner", () => {
  const visible = getProfileForRequester(profile, { id: 42 }, {
    canViewExactBirthDate: true,
  });

  assert.equal(visible.fecha_de_nacimiento, profile.fecha_de_nacimiento);
  assert.equal(visible.edad, getProfileAge(profile.fecha_de_nacimiento));
});

test("getProfileForRequester redacts contact for anonymous users", () => {
  const sanitized = getProfileForRequester(profile, null);

  assert.equal(sanitized.email, null);
  assert.equal(sanitized.telefono, null);
  assert.equal(sanitized.whatsapp_url, null);
  assert.equal(sanitized.agente_contacto, null);
  assert.equal(sanitized.fecha_de_nacimiento, null);
  assert.equal(sanitized.edad, getProfileAge(profile.fecha_de_nacimiento));
});
