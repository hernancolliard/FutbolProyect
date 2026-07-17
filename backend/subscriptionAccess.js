const SUBSCRIPTION_PLAN_BY_USER_TYPE = Object.freeze({
  postulante: "postulante",
  ofertante: "ofertante",
  agencia: "ofertante",
});

const normalizeSubscriptionValue = (value) =>
  typeof value === "string" ? value.trim().toLowerCase() : "";

const getRequiredSubscriptionPlan = (userType) =>
  SUBSCRIPTION_PLAN_BY_USER_TYPE[normalizeSubscriptionValue(userType)] || null;

const isSubscriptionPlanCompatible = (userType, subscriptionPlan) => {
  const requiredPlan = getRequiredSubscriptionPlan(userType);
  return Boolean(
    requiredPlan &&
      requiredPlan === normalizeSubscriptionValue(subscriptionPlan),
  );
};

module.exports = {
  SUBSCRIPTION_PLAN_BY_USER_TYPE,
  getRequiredSubscriptionPlan,
  isSubscriptionPlanCompatible,
};
