const CURRENT_TERMS_VERSION = "2026-07-17";
const CURRENT_PRIVACY_VERSION = "2026-07-17";
const LEGAL_ACCEPTANCE_REQUIRED_MESSAGE =
  "Debes aceptar los Términos y Condiciones y la Política de Privacidad para crear una cuenta.";

const hasAcceptedLegalPolicies = (acceptedTerms) => acceptedTerms === true;

module.exports = {
  CURRENT_TERMS_VERSION,
  CURRENT_PRIVACY_VERSION,
  LEGAL_ACCEPTANCE_REQUIRED_MESSAGE,
  hasAcceptedLegalPolicies,
};
