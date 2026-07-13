const jwt = require("jsonwebtoken");
const db = require("../db");

const TRACKING_SCOPE = "paypal_checkout";
const STATUS_TIMESTAMP_COLUMNS = {
  APPROVED: "approved_at",
  CANCELLED: "cancelled_at",
  CAPTURE_STARTED: "capture_started_at",
  PAYPAL_COMPLETED: "paypal_completed_at",
  COMPLETED: "completed_at",
};

const trimText = (value, maxLength) => {
  const text = String(value || "").trim();
  return text ? text.slice(0, maxLength) : null;
};

const logPaypalCheckoutEvent = ({
  status,
  orderID,
  userId,
  subscriptionId = null,
  errorCode = null,
  errorMessage = null,
}) => {
  const payload = {
    status,
    orderID: trimText(orderID, 80),
    userId: Number(userId) || null,
    subscriptionId: Number(subscriptionId) || null,
    errorCode: trimText(errorCode, 100),
    errorMessage: trimText(errorMessage, 500),
    timestamp: new Date().toISOString(),
  };
  const writer = status.includes("ERROR") || status.includes("FAILED")
    ? console.error
    : console.log;
  writer("[PAYPAL_CHECKOUT]", JSON.stringify(payload));
};

const createPaypalTrackingToken = ({ orderID, userId }) =>
  jwt.sign(
    {
      scope: TRACKING_SCOPE,
      orderID: String(orderID),
      userId: Number(userId),
    },
    process.env.JWT_SECRET,
    { expiresIn: "6h" },
  );

const verifyPaypalTrackingToken = (token) => {
  const payload = jwt.verify(String(token || ""), process.env.JWT_SECRET);
  if (
    payload.scope !== TRACKING_SCOPE ||
    !payload.orderID ||
    !Number.isInteger(Number(payload.userId))
  ) {
    throw new Error("Invalid PayPal checkout tracking token");
  }
  return {
    orderID: String(payload.orderID),
    userId: Number(payload.userId),
  };
};

const normalizePaypalError = (error) => {
  let paypalDetails = null;
  try {
    const rawDetails = error?._originalError?.text;
    paypalDetails = rawDetails ? JSON.parse(rawDetails) : null;
  } catch (_parseError) {
    paypalDetails = null;
  }

  const statusCode = Number(error?.statusCode) || null;
  return {
    errorCode: trimText(
      paypalDetails?.name || error?.code || (statusCode ? `HTTP_${statusCode}` : "PAYPAL_ERROR"),
      100,
    ),
    errorMessage: trimText(paypalDetails?.message || error?.message || "PayPal error", 500),
    details: {
      statusCode,
      debugId: trimText(paypalDetails?.debug_id, 120),
    },
  };
};

const persistSafely = async (operation, context) => {
  try {
    await operation();
    return true;
  } catch (error) {
    console.error("[PAYPAL_CHECKOUT_TELEMETRY_DB_ERROR]", JSON.stringify({
      operation: context.operation,
      orderID: context.orderID,
      code: error.code || null,
      message: trimText(error.message, 300),
    }));
    return false;
  }
};

const createPaypalCheckoutAttempt = async ({
  orderID,
  userId,
  subscriptionId,
  plan,
  billingCycle,
}) => {
  logPaypalCheckoutEvent({ status: "CREATED", orderID, userId, subscriptionId });
  return persistSafely(
    () => db.query(
      `INSERT INTO paypal_checkout_attempts
        (paypal_order_id, id_usuario, subscription_id, plan, billing_cycle, status)
       VALUES
        (@orderID, @userId, @subscriptionId, @plan, @billingCycle, 'CREATED')
       ON CONFLICT (paypal_order_id) DO UPDATE SET
        id_usuario = EXCLUDED.id_usuario,
        subscription_id = EXCLUDED.subscription_id,
        plan = EXCLUDED.plan,
        billing_cycle = EXCLUDED.billing_cycle,
        updated_at = NOW()`,
      {
        orderID,
        userId,
        subscriptionId: subscriptionId || null,
        plan,
        billingCycle: billingCycle || null,
      },
    ),
    { operation: "create", orderID },
  );
};

const updatePaypalCheckoutAttempt = async ({
  orderID,
  userId,
  status,
  subscriptionId = null,
  paypalCaptureId = null,
  errorCode = null,
  errorMessage = null,
  details = {},
  preservePaidStatus = false,
}) => {
  logPaypalCheckoutEvent({
    status,
    orderID,
    userId,
    subscriptionId,
    errorCode,
    errorMessage,
  });

  const timestampColumn = STATUS_TIMESTAMP_COLUMNS[status];
  const timestampAssignment = timestampColumn
    ? `, ${timestampColumn} = COALESCE(${timestampColumn}, NOW())`
    : "";
  return persistSafely(
    () => db.query(
      `UPDATE paypal_checkout_attempts
       SET status = CASE
             WHEN @preservePaidStatus = TRUE
               AND status IN ('PAYPAL_COMPLETED', 'COMPLETED', 'PROCESSING_ERROR')
             THEN status
             ELSE @status
           END,
           subscription_id = COALESCE(@subscriptionId, subscription_id),
           paypal_capture_id = COALESCE(@paypalCaptureId, paypal_capture_id),
           error_code = COALESCE(@errorCode, error_code),
           error_message = COALESCE(@errorMessage, error_message),
           last_event_payload = @details::jsonb,
           updated_at = NOW()
           ${timestampAssignment}
       WHERE paypal_order_id = @orderID AND id_usuario = @userId`,
      {
        orderID,
        userId,
        status,
        subscriptionId: subscriptionId || null,
        paypalCaptureId: paypalCaptureId || null,
        errorCode: trimText(errorCode, 100),
        errorMessage: trimText(errorMessage, 500),
        details: JSON.stringify(details || {}),
        preservePaidStatus,
      },
    ),
    { operation: `update:${status}`, orderID },
  );
};

module.exports = {
  createPaypalCheckoutAttempt,
  createPaypalTrackingToken,
  normalizePaypalError,
  updatePaypalCheckoutAttempt,
  verifyPaypalTrackingToken,
};
