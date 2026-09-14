const PROFILE_COMPLETION_SCORE_TOTAL = 10;
const PROFILE_COMPLETION_REQUIRED_SCORE = 7;

const buildProfileCompletionScoreSql = (alias = "p") => {
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(alias)) {
    throw new Error("Alias de perfil inválido.");
  }

  return `(
    CASE WHEN NULLIF(TRIM(${alias}.foto_perfil_url), '') IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN NULLIF(TRIM(${alias}.telefono), '') IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN NULLIF(TRIM(${alias}.nacionalidad), '') IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN NULLIF(TRIM(${alias}.resumen_profesional), '') IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN NULLIF(TRIM(${alias}.cv_url), '') IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN NULLIF(TRIM(${alias}.posicion_principal), '') IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN ${alias}.altura_cm IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN ${alias}.peso_kg IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN NULLIF(TRIM(${alias}.pie_dominante), '') IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN ${alias}.fecha_de_nacimiento IS NOT NULL THEN 1 ELSE 0 END
  )`;
};

const getProfileCompletionPercent = (score) => {
  const numericScore = Number(score);
  if (!Number.isFinite(numericScore)) return 0;
  return Math.min(
    100,
    Math.max(0, Math.round((numericScore / PROFILE_COMPLETION_SCORE_TOTAL) * 100)),
  );
};

const isProfileCompletionScoreComplete = (score) =>
  Number(score) >= PROFILE_COMPLETION_REQUIRED_SCORE;

module.exports = {
  PROFILE_COMPLETION_REQUIRED_SCORE,
  PROFILE_COMPLETION_SCORE_TOTAL,
  buildProfileCompletionScoreSql,
  getProfileCompletionPercent,
  isProfileCompletionScoreComplete,
};
