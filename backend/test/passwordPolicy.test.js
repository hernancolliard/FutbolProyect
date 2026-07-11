const test = require("node:test");
const assert = require("node:assert/strict");
const { validateNewPassword } = require("../passwordPolicy");

test("acepta una contraseña nueva valida", () => {
  assert.equal(validateNewPassword("segura-2026"), null);
});

test("rechaza contraseñas demasiado cortas", () => {
  assert.equal(
    validateNewPassword("corta"),
    "La nueva contraseña debe tener al menos 8 caracteres.",
  );
});

test("rechaza contraseñas que superan el limite de bcrypt", () => {
  assert.equal(
    validateNewPassword("ñ".repeat(37)),
    "La nueva contraseña no puede superar los 72 bytes.",
  );
});
