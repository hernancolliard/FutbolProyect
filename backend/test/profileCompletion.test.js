const test = require("node:test");
const assert = require("node:assert/strict");
const {
  PROFILE_COMPLETION_REQUIRED_SCORE,
  buildProfileCompletionScoreSql,
  getProfileCompletionPercent,
  isProfileCompletionScoreComplete,
} = require("../profileCompletion");

test("considera completo un perfil desde siete de diez campos", () => {
  assert.equal(PROFILE_COMPLETION_REQUIRED_SCORE, 7);
  assert.equal(isProfileCompletionScoreComplete(6), false);
  assert.equal(isProfileCompletionScoreComplete(7), true);
  assert.equal(getProfileCompletionPercent(7), 70);
});

test("limita el porcentaje de completitud entre cero y cien", () => {
  assert.equal(getProfileCompletionPercent(-2), 0);
  assert.equal(getProfileCompletionPercent(12), 100);
  assert.equal(getProfileCompletionPercent("invalid"), 0);
});

test("genera SQL sólo para alias seguros", () => {
  assert.match(buildProfileCompletionScoreSql("pu"), /pu\.foto_perfil_url/);
  assert.throws(() => buildProfileCompletionScoreSql("p; DROP TABLE usuarios"));
});
