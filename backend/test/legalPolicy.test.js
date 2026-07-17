const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const {
  CURRENT_TERMS_VERSION,
  CURRENT_PRIVACY_VERSION,
  hasAcceptedLegalPolicies,
} = require("../legalPolicy");

test("solo considera válida la aceptación legal booleana y explícita", () => {
  assert.equal(hasAcceptedLegalPolicies(true), true);
  assert.equal(hasAcceptedLegalPolicies(false), false);
  assert.equal(hasAcceptedLegalPolicies("true"), false);
  assert.equal(hasAcceptedLegalPolicies(1), false);
  assert.equal(hasAcceptedLegalPolicies(undefined), false);
});

test("las versiones legales están identificadas para guardar evidencia", () => {
  assert.match(CURRENT_TERMS_VERSION, /^\d{4}-\d{2}-\d{2}$/);
  assert.match(CURRENT_PRIVACY_VERSION, /^\d{4}-\d{2}-\d{2}$/);
});

test("el registro valida la aceptación antes de insertar el usuario", () => {
  const usersRoute = fs.readFileSync(
    path.join(__dirname, "..", "routes", "users.js"),
    "utf8",
  );
  const registerRoute = usersRoute.slice(usersRoute.indexOf('router.post("/register"'));
  const acceptanceCheck = registerRoute.indexOf(
    "hasAcceptedLegalPolicies(req.body.acceptedTerms)",
  );
  const userInsert = registerRoute.indexOf("INSERT INTO usuarios");

  assert.notEqual(acceptanceCheck, -1);
  assert.notEqual(userInsert, -1);
  assert.ok(acceptanceCheck < userInsert);
});
