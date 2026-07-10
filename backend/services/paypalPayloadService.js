const getNested = (object, paths) => {
  for (const path of paths) {
    const value = path.split(".").reduce((current, key) => {
      if (current === undefined || current === null) return undefined;
      return current[key];
    }, object);
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return null;
};

const extractPaypalSubscriptionId = (event) =>
  getNested(event, [
    "resource.billing_agreement_id",
    "resource.subscription_id",
    "resource.id",
    "resource.supplementary_data.related_ids.subscription_id",
  ]);

const extractPaypalTransactionId = (event) =>
  getNested(event, [
    "resource.id",
    "resource.sale_id",
    "resource.capture_id",
    "resource.supplementary_data.related_ids.sale_id",
  ]);

const extractOriginalSaleId = (event) =>
  getNested(event, [
    "resource.sale_id",
    "resource.parent_payment",
    "resource.supplementary_data.related_ids.sale_id",
    "resource.links.0.href",
  ]);

const extractPaypalSaleAmount = (event) => {
  const value = getNested(event, [
    "resource.amount.total",
    "resource.amount.value",
    "resource.gross_amount.value",
    "resource.seller_receivable_breakdown.gross_amount.value",
  ]);
  const currency = getNested(event, [
    "resource.amount.currency",
    "resource.amount.currency_code",
    "resource.gross_amount.currency_code",
    "resource.seller_receivable_breakdown.gross_amount.currency_code",
  ]);

  if (!value || !currency) return null;
  return { value: String(value), currency: String(currency).toUpperCase() };
};

module.exports = {
  extractPaypalSubscriptionId,
  extractPaypalTransactionId,
  extractPaypalSaleAmount,
  extractOriginalSaleId,
};
