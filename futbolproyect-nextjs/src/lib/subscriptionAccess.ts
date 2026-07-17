type SubscriptionUser = {
  tipo_usuario?: string | null;
  subscription_plan?: string | null;
  subscription_status?: string | null;
  subscription_end_date?: string | null;
};

const normalize = (value?: string | null) => value?.trim().toLowerCase() || "";

export const getRequiredSubscriptionPlan = (userType?: string | null) => {
  const normalizedType = normalize(userType);

  if (normalizedType === "postulante") return "postulante";
  if (normalizedType === "ofertante" || normalizedType === "agencia") {
    return "ofertante";
  }

  return null;
};

export const hasCompatibleActiveSubscription = (
  user?: SubscriptionUser | null,
) => {
  if (!user || normalize(user.subscription_status) !== "activa") return false;

  const requiredPlan = getRequiredSubscriptionPlan(user.tipo_usuario);
  if (!requiredPlan || normalize(user.subscription_plan) !== requiredPlan) {
    return false;
  }

  if (user.subscription_end_date) {
    const endDate = new Date(user.subscription_end_date);
    if (!Number.isNaN(endDate.getTime()) && endDate.getTime() <= Date.now()) {
      return false;
    }
  }

  return true;
};
