const test = require("node:test");
const assert = require("node:assert/strict");

const {
  getRequiredSubscriptionPlan,
  isSubscriptionPlanCompatible,
} = require("../subscriptionAccess");

test("asigna el plan postulante a los usuarios postulantes", () => {
  assert.equal(getRequiredSubscriptionPlan("postulante"), "postulante");
  assert.equal(isSubscriptionPlanCompatible("postulante", "postulante"), true);
  assert.equal(isSubscriptionPlanCompatible("postulante", "ofertante"), false);
});

test("asigna el plan ofertante a ofertantes y agencias", () => {
  assert.equal(getRequiredSubscriptionPlan("ofertante"), "ofertante");
  assert.equal(getRequiredSubscriptionPlan("agencia"), "ofertante");
  assert.equal(isSubscriptionPlanCompatible("ofertante", "ofertante"), true);
  assert.equal(isSubscriptionPlanCompatible("agencia", "ofertante"), true);
});

test("normaliza mayusculas y rechaza tipos o planes desconocidos", () => {
  assert.equal(isSubscriptionPlanCompatible(" Postulante ", " POSTULANTE "), true);
  assert.equal(getRequiredSubscriptionPlan("administrador"), null);
  assert.equal(isSubscriptionPlanCompatible("administrador", "postulante"), false);
  assert.equal(isSubscriptionPlanCompatible("postulante", null), false);
});
