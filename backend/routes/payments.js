const express = require("express");
const crypto = require("crypto");
const {
  sendSubscriptionConfirmationEmail,
} = require("../services/emailService");
const { MercadoPagoConfig, Preference, Payment } = require("mercadopago");
const paypal = require("@paypal/checkout-server-sdk");
const db = require("../db");
require("dotenv").config();
const {
  attachReferralToSubscription,
  createCommissionForPayment,
  reverseCommissionByTransaction,
} = require("../services/affiliateService");
const {
  extractPaypalSubscriptionId,
  extractPaypalTransactionId,
  extractPaypalSaleAmount,
  extractOriginalSaleId,
} = require("../services/paypalPayloadService");
const {
  createPaypalCheckoutAttempt,
  createPaypalTrackingToken,
  normalizePaypalError,
  updatePaypalCheckoutAttempt,
  verifyPaypalTrackingToken,
} = require("../services/paypalCheckoutTelemetryService");

const router = express.Router();

const { verificarToken } = require("../middleware/authMiddleware");

// Configura Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN,
});

const getBackendUrl = (req) => {
  if (process.env.BACKEND_URL) {
    return process.env.BACKEND_URL.replace(/\/+$/, "");
  }
  const forwardedProto = req.headers["x-forwarded-proto"];
  const protocol = forwardedProto || req.protocol;
  const host = req.get("host");
  return `${protocol}://${host}`;
};

const getFrontendUrl = () => {
  if (!process.env.FRONTEND_URL) return "";
  return process.env.FRONTEND_URL.replace(/\/+$/, "");
};

const VALID_SUBSCRIPTION_PLANS = new Set(["ofertante", "postulante"]);
const VALID_BILLING_CYCLES = new Set(["monthly", "annual"]);
const VALID_PAYPAL_CLIENT_EVENTS = new Set([
  "APPROVED",
  "CANCELLED",
  "SDK_ERROR",
  "CLIENT_CAPTURE_ERROR",
]);

const sanitizePaypalClientEventDetails = (details) => ({
  httpStatus: Number(details?.httpStatus) || null,
  errorName: String(details?.errorName || "").slice(0, 100) || null,
  errorMessage: String(details?.errorMessage || "").slice(0, 500) || null,
  fundingSource: String(details?.fundingSource || "").slice(0, 50) || null,
});

const getSubscriptionPaymentContext = (payment) => {
  const metadata = payment?.metadata || {};
  const externalReference = String(payment?.external_reference || "");
  const referenceParts = externalReference.split("|");
  const normalizedDescription = String(payment?.description || "").toLowerCase();

  const userId = String(
    metadata.user_id ||
      (referenceParts.length === 3 ? referenceParts[0] : externalReference),
  ).trim();
  const plan = String(
    metadata.plan_type ||
      (referenceParts.length === 3 ? referenceParts[1] : "") ||
      (normalizedDescription.includes("postulante")
        ? "postulante"
        : normalizedDescription.includes("ofertante")
          ? "ofertante"
          : ""),
  ).trim().toLowerCase();
  const cycle = String(
    metadata.billing_cycle ||
      (referenceParts.length === 3 ? referenceParts[2] : "") ||
      (normalizedDescription.includes("annual")
        ? "annual"
        : normalizedDescription.includes("monthly")
          ? "monthly"
          : ""),
  ).trim().toLowerCase();

  if (
    !/^\d+$/.test(userId) ||
    !VALID_SUBSCRIPTION_PLANS.has(plan) ||
    !VALID_BILLING_CYCLES.has(cycle)
  ) {
    return null;
  }

  return { userId: parseInt(userId, 10), plan, cycle };
};

const calculateSubscriptionEndDate = (cycle, startDate = new Date()) => {
  const endDate = new Date(startDate);
  if (Number.isNaN(endDate.getTime())) {
    throw new Error(`Invalid subscription start date: ${startDate}`);
  }
  if (cycle === "monthly") {
    endDate.setMonth(endDate.getMonth() + 1);
  } else if (cycle === "annual") {
    endDate.setFullYear(endDate.getFullYear() + 1);
  } else {
    throw new Error(`Unsupported billing cycle: ${cycle}`);
  }
  return endDate;
};

const getPaypalCapture = (captureResult) =>
  captureResult?.purchase_units?.[0]?.payments?.captures?.[0] || null;

const getPaypalCustomId = (captureResult) =>
  captureResult?.purchase_units?.[0]?.custom_id ||
  getPaypalCapture(captureResult)?.custom_id ||
  null;

const parsePaypalCustomId = (customId) => {
  const value = String(customId || "");
  if (value.startsWith("fpsub:")) {
    const id = Number.parseInt(value.replace("fpsub:", ""), 10);
    return Number.isFinite(id) ? { type: "subscription", subscriptionId: id } : null;
  }
  if (value.includes("_")) return { type: "featured_offer", value };
  const [plan, cycle] = value.split("-");
  if (VALID_SUBSCRIPTION_PLANS.has(plan) && VALID_BILLING_CYCLES.has(cycle)) {
    return { type: "legacy_subscription", plan, cycle };
  }
  return null;
};

const verifyPaypalWebhookSignature = async (req, event) => {
  if (!process.env.PAYPAL_WEBHOOK_ID) {
    return process.env.NODE_ENV === "production" ? "FAILED" : "PENDING";
  }

  const transmissionId = req.get("paypal-transmission-id");
  const transmissionTime = req.get("paypal-transmission-time");
  const transmissionSig = req.get("paypal-transmission-sig");
  const certUrl = req.get("paypal-cert-url");
  const authAlgo = req.get("paypal-auth-algo");

  if (!transmissionId || !transmissionTime || !transmissionSig || !certUrl || !authAlgo) {
    return "FAILED";
  }

  try {
    const verification = await paypalClient.execute({
      path: "/v1/notifications/verify-webhook-signature",
      verb: "POST",
      headers: { "Content-Type": "application/json" },
      body: {
        auth_algo: authAlgo,
        cert_url: certUrl,
        transmission_id: transmissionId,
        transmission_sig: transmissionSig,
        transmission_time: transmissionTime,
        webhook_id: process.env.PAYPAL_WEBHOOK_ID,
        webhook_event: event,
      },
    });

    return verification.result?.verification_status === "SUCCESS"
      ? "VERIFIED"
      : "FAILED";
  } catch (error) {
    console.error("Error verificando webhook PayPal:", error.message);
    return "FAILED";
  }
};

// Configura PayPal
// --- INICIO DE LA MODIFICACIÓN ---

// Configura PayPal dinámicamente
// --- INICIO DE LA MODIFICACIÓN ---

// Importa LiveEnvironment
const { LiveEnvironment, SandboxEnvironment } = paypal.core;

// Configura PayPal dinámicamente
let environment;
if (process.env.PAYPAL_MODE === "live") {
  console.log("CONFIRMACIÓN: Usando credenciales de PayPal en modo LIVE.");
  environment = new LiveEnvironment(
    process.env.PAYPAL_CLIENT_ID,
    process.env.PAYPAL_CLIENT_SECRET
  );
} else {
  console.log("CONFIRMACIÓN: Usando credenciales de PayPal en modo SANDBOX.");
  environment = new SandboxEnvironment(
    process.env.PAYPAL_CLIENT_ID,
    process.env.PAYPAL_CLIENT_SECRET
  );
}
const paypalClient = new paypal.core.PayPalHttpClient(environment);

// --- FIN DE LA MODIFICACIÓN ---

router.post("/create-preference-mp", verificarToken, async (req, res) => {
  const { planType, billingCycle } = req.body;
  const userId = req.user.id;

  try {
    let title = "";
    let unit_price = 0;
    let description = `${planType}-${billingCycle}`;

    if (planType === "ofertante" || planType === "postulante") {
      const planResult = await db.query(
        "SELECT price_mp FROM subscription_plans WHERE plan_name = @planName",
        { planName: billingCycle }
      );
      if (planResult.rows.length === 0) {
        return res
          .status(400)
          .json({ message: "Ciclo de facturación no válido." });
      }
      const planPriceMp = parseFloat(planResult.rows[0].price_mp);
      if (isNaN(planPriceMp) || planPriceMp <= 0) {
        return res
          .status(500)
          .json({ message: "Precio de suscripción inválido." });
      }
      unit_price = planPriceMp;
      title = `Suscripción ${planType} - ${billingCycle}`;
    } else if (planType === "destacar_oferta") {
      if (!req.body.offerId) {
        return res
          .status(400)
          .json({ message: "ID de oferta es requerido para destacar una oferta." });
      }
      title = "Destacar Oferta";
      unit_price = 5000;
      description = planType;
    } else {
      return res.status(400).json({ message: "Tipo de plan no válido." });
    }

    const backendUrl = getBackendUrl(req);
    const frontendUrl = getFrontendUrl();
    const useSandbox = process.env.MERCADO_PAGO_SANDBOX === "true";

    if (!frontendUrl) {
      return res.status(500).json({ message: "Frontend URL no configurada." });
    }

    const preference = new Preference(client);
    const response = await preference.create({
      body: {
        items: [
          {
            title: title,
            description: description,
            unit_price: unit_price,
            quantity: 1,
            currency_id: "ARS",
          },
        ],
        external_reference:
          planType === "destacar_oferta"
            ? `${userId}_${req.body.offerId}`
            : `${userId}|${planType}|${billingCycle}`,
        metadata: {
          user_id: String(userId),
          plan_type: planType,
          billing_cycle: billingCycle,
          ...(req.body.offerId
            ? { offer_id: String(req.body.offerId) }
            : {}),
        },
        back_urls: {
          success: `${frontendUrl}/payment/success/mercadopago`,
          failure: `${frontendUrl}/payment/cancelled/mercadopago`,
          pending: `${frontendUrl}/payment/pending/mercadopago`,
        },
        auto_return: "approved",
        notification_url: `${backendUrl}/api/payments/webhook-mp`,
      },
    });

    const initPoint = useSandbox
      ? response.sandbox_init_point || response.init_point
      : response.init_point;

    if (!initPoint) {
      console.error("Mercado Pago preference created without an init_point", response);
      return res
        .status(500)
        .json({ message: "No se pudo generar el enlace de pago de Mercado Pago." });
    }

    res.json({ init_point: initPoint, preferenceId: response.id });
  } catch (error) {
    console.error("Error al crear preferencia de Mercado Pago:", error);
    res.status(500).json({ message: "Error al crear la preferencia de pago." });
  }
});

router.post("/webhook-mp", async (req, res) => {
  const topic = req.query.topic || req.query.type;

  try {
    if (topic === "payment") {
      const paymentId =
        req.body.data?.id || req.query["data.id"] || req.query.id;
      const payment = await new Payment(client).get({ id: paymentId });

      const status = payment.status;

      if (status === "approved") {
        const paymentMetadata = payment.metadata || {};
        const externalReference = String(payment.external_reference || "");
        const isFeaturedPayment =
          paymentMetadata.plan_type === "destacar_oferta" ||
          externalReference.includes("_");

        if (isFeaturedPayment) {
          const [, referenceOfferId] = externalReference.split("_");
          const offerId = paymentMetadata.offer_id || referenceOfferId;
          if (!/^\d+$/.test(String(offerId || ""))) {
            throw new Error(`Invalid featured offer payment reference: ${externalReference}`);
          }
          const featuredUntil = new Date();
          featuredUntil.setDate(featuredUntil.getDate() + 7);

          const queryText = `
            UPDATE ofertas_laborales
            SET is_featured = 1, featured_until = @featuredUntil
            WHERE id = @offerId;
          `;
          await db.query(queryText, {
            offerId: parseInt(offerId, 10),
            featuredUntil,
          });
        } else {
          const subscriptionContext = getSubscriptionPaymentContext(payment);
          if (!subscriptionContext) {
            throw new Error(
              `Invalid subscription payment metadata for payment ${paymentId}`,
            );
          }
          const { userId, plan, cycle } = subscriptionContext;
          const fechaFin = calculateSubscriptionEndDate(
            cycle,
            payment.date_approved || payment.date_created || new Date(),
          );

          const queryText = `
            INSERT INTO suscripciones (id_usuario, id_mp_pago, plan, fecha_fin, estado, metodo_pago)
            VALUES (@userId, @paymentId, @plan, @fechaFin, 'activa', 'mercadopago')
            ON CONFLICT (id_usuario) DO UPDATE SET
              id_mp_pago = @paymentId,
              plan = @plan,
              fecha_fin = @fechaFin,
              estado = 'activa',
              metodo_pago = 'mercadopago';
          `;
          await db.query(queryText, {
            userId,
            paymentId: paymentId.toString(),
            plan,
            fechaFin,
          });

          // Send confirmation email
          const userResult = await db.query('SELECT nombre, email FROM usuarios WHERE id = @userId', { userId });
          if (userResult.rows.length > 0) {
            const user = userResult.rows[0];
            sendSubscriptionConfirmationEmail(user.email, user.nombre, plan, fechaFin)
              .catch(emailError => console.error("Failed to send subscription email for MP:", emailError));
          }
        }
      }
    }
    res.status(200).send("OK");
  } catch (error) {
    console.error("Error en el webhook de Mercado Pago:", error);
    res.status(500).send("Error en el servidor");
  }
});

router.post("/create-paypal-order", verificarToken, async (req, res) => {
  const { planType, billingCycle } = req.body;

  // --- NUEVO LOG 1: Verificar que la ruta se está ejecutando ---
  console.log("Iniciando creación de orden de PayPal para:", {
    planType,
    billingCycle,
  });

  try {
    let description = "";
    let value = "0.00";
    let custom_id;
    let pendingSubscriptionId = null;

    if (planType === "ofertante" || planType === "postulante") {
      const planResult = await db.query(
        "SELECT price_usd FROM subscription_plans WHERE plan_name = @planName",
        { planName: billingCycle }
      );
      if (planResult.rows.length === 0) {
        // --- NUEVO LOG 2: Error de plan no válido ---
        console.error("Error: Ciclo de facturación no válido:", billingCycle);
        return res
          .status(400)
          .json({ message: "Ciclo de facturación no válido." });
      }

      const price = parseFloat(planResult.rows[0].price_usd);
      if (isNaN(price)) {
        // --- NUEVO LOG 3: Error de precio inválido ---
        console.error(
          "Error: Precio inválido recibido de la base de datos:",
          planResult.rows[0].price_usd
        );
        return res
          .status(500)
          .json({ message: "Formato de precio no válido." });
      }
      value = price.toFixed(2);
      description = `Suscripción ${planType} - ${billingCycle}`;
      const pendingSubscription = await db.query(
        `INSERT INTO suscripciones
          (id_usuario, plan, estado, metodo_pago, affiliate_referral_id)
         VALUES
          (@userId, @plan, 'pendiente', 'paypal',
           (SELECT id FROM affiliate_referrals WHERE referred_user_id = @userId))
         ON CONFLICT (id_usuario) DO UPDATE SET
           plan = @plan,
           estado = CASE
             WHEN suscripciones.estado = 'activa' AND suscripciones.fecha_fin > NOW()
             THEN suscripciones.estado
             ELSE 'pendiente'
           END,
           metodo_pago = 'paypal',
           affiliate_referral_id = COALESCE(
             suscripciones.affiliate_referral_id,
             (SELECT id FROM affiliate_referrals WHERE referred_user_id = @userId)
           ),
           updated_at = NOW()
         RETURNING id`,
        { userId: req.user.id, plan: planType },
      );
      pendingSubscriptionId = pendingSubscription.rows[0].id;
      custom_id = `fpsub:${pendingSubscriptionId}`;
    } else if (planType === "destacar_oferta") {
      description = "Destacar Oferta";
      value = "4.00";
      custom_id = `${req.user.id}_${req.body.offerId}`;
    } else {
      return res.status(400).json({ message: "Tipo de plan no válido." });
    }

    // --- NUEVO LOG 4: Datos de la orden antes de crearla ---
    console.log("Datos para la orden de PayPal:", {
      intent: "CAPTURE",
      value,
      description,
      custom_id,
    });

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: { currency_code: "USD", value: value },
          description: description,
          custom_id: custom_id,
        },
      ],
    });

    const order = await paypalClient.execute(request);
    if (pendingSubscriptionId) {
      await db.query(
        `UPDATE suscripciones
         SET paypal_order_id = @orderId, updated_at = NOW()
         WHERE id = @subscriptionId`,
        { orderId: order.result.id, subscriptionId: pendingSubscriptionId },
      );
    }

    await createPaypalCheckoutAttempt({
      orderID: order.result.id,
      userId: req.user.id,
      subscriptionId: pendingSubscriptionId,
      plan: planType,
      billingCycle,
    });
    const trackingToken = createPaypalTrackingToken({
      orderID: order.result.id,
      userId: req.user.id,
    });

    res.json({ orderID: order.result.id, trackingToken });
  } catch (error) {
    // --- NUEVO LOG 6: ¡ESTE ES EL MÁS IMPORTANTE! ---
    console.error(
      "----------- ERROR CRÍTICO AL CREAR ORDEN DE PAYPAL -----------"
    );
    // Imprime el error completo que devuelve la API de PayPal
    console.error("Mensaje de error:", error.message);
    if (error.statusCode) {
      console.error("Status Code:", error.statusCode);
      console.error("Detalles del error (Headers):", error.headers);
    }
    console.error("----------------------------------------------------------");

    res.status(500).json({ message: "Error al crear la orden de PayPal." });
  }
});

router.post("/paypal-checkout-event", async (req, res) => {
  const { trackingToken, event } = req.body || {};
  if (!VALID_PAYPAL_CLIENT_EVENTS.has(event)) {
    return res.status(400).json({ message: "Evento de PayPal no valido." });
  }

  let trackingContext;
  try {
    trackingContext = verifyPaypalTrackingToken(trackingToken);
  } catch (_error) {
    return res.status(401).json({ message: "Seguimiento de PayPal no valido o vencido." });
  }

  const details = sanitizePaypalClientEventDetails(req.body.details);
  const persisted = await updatePaypalCheckoutAttempt({
    ...trackingContext,
    status: event,
    errorCode:
      event === "SDK_ERROR" || event === "CLIENT_CAPTURE_ERROR"
        ? details.errorName || event
        : null,
    errorMessage:
      event === "SDK_ERROR" || event === "CLIENT_CAPTURE_ERROR"
        ? details.errorMessage
        : null,
    details,
    preservePaidStatus: true,
  });

  return res.status(persisted ? 200 : 202).json({ ok: true, persisted });
});

router.post("/capture-paypal-order-legacy", verificarToken, async (req, res) => {
  res.status(410).json({
    message: "Endpoint legacy deshabilitado. Usar /api/payments/capture-paypal-order.",
  });
});

router.post("/capture-paypal-order-legacy-disabled", verificarToken, async (req, res) => {
  return res.status(410).json({
    message: "Endpoint legacy deshabilitado.",
  });

  const { orderID } = req.body;
  const userId = req.user.id;

  const request = new paypal.orders.OrdersCaptureRequest(orderID);
  request.prefer("return=representation");

  try {
    const capture = await paypalClient.execute(request);
    const paypalPaymentId = capture.result.id;
    const status = capture.result.status;
    const customId = getPaypalCustomId(capture.result);

    if (status === "COMPLETED") {
      if (customId.includes("_")) {
        // Destacar oferta
        const [parsedUserId, offerId] = customId.split("_");
        const featuredUntil = new Date();
        featuredUntil.setDate(featuredUntil.getDate() + 7);

        const queryText = `
          UPDATE ofertas_laborales
          SET is_featured = 1, featured_until = @featuredUntil
          WHERE id = @offerId;
        `;
        await db.query(queryText, {
          offerId: parseInt(offerId, 10),
          featuredUntil,
        });
        res.json({ success: true });
      } else {
        // Suscripción
        const [plan, cycle] = customId.split("-");
        if (
          !VALID_SUBSCRIPTION_PLANS.has(plan) ||
          !VALID_BILLING_CYCLES.has(cycle)
        ) {
          return res.status(400).json({
            message: "Los datos del plan de suscripción no son válidos.",
          });
        }
        const fechaFin = calculateSubscriptionEndDate(cycle);

        const queryText = `
          INSERT INTO suscripciones (id_usuario, id_paypal_pago, plan, fecha_fin, estado, metodo_pago)
          VALUES (@userId, @paypalPaymentId, @plan, @fechaFin, 'activa', 'paypal')
          ON CONFLICT (id_usuario) DO UPDATE SET
            id_paypal_pago = @paypalPaymentId,
            plan = @plan,
            fecha_fin = @fechaFin,
            estado = 'activa',
            metodo_pago = 'paypal';
        `;
        await db.query(queryText, {
          userId: parseInt(userId, 10),
          paypalPaymentId: paypalPaymentId.toString(),
          plan,
          fechaFin,
        });
        
        // Send confirmation email
        const userResult = await db.query('SELECT nombre, email FROM usuarios WHERE id = @userId', { userId: parseInt(userId, 10) });
        if (userResult.rows.length > 0) {
          const user = userResult.rows[0];
          sendSubscriptionConfirmationEmail(user.email, user.nombre, plan, fechaFin)
            .catch(emailError => console.error("Failed to send subscription email for PayPal:", emailError));
        }

        res.json({ success: true });
      }
    } else {
      res.status(400).json({ message: "El pago de PayPal no se completó." });
    }
  } catch (error) {
    console.error("Error al capturar orden de PayPal:", error);
    res.status(500).json({ message: "Error al capturar la orden de PayPal." });
  }
});

router.post("/capture-paypal-order", verificarToken, async (req, res) => {
  const { orderID } = req.body;
  const userId = req.user.id;

  if (!orderID || typeof orderID !== "string") {
    return res.status(400).json({ message: "OrderID de PayPal no valido." });
  }

  const request = new paypal.orders.OrdersCaptureRequest(orderID);
  request.prefer("return=representation");
  let paypalCaptured = false;

  await updatePaypalCheckoutAttempt({
    orderID,
    userId,
    status: "CAPTURE_STARTED",
  });

  try {
    const capture = await paypalClient.execute(request);
    const captureRecord = getPaypalCapture(capture.result);
    const paypalPaymentId = captureRecord?.id || capture.result.id;
    const status = capture.result.status;
    const customId = getPaypalCustomId(capture.result);
    const parsedCustomId = parsePaypalCustomId(customId);

    if (status !== "COMPLETED") {
      await updatePaypalCheckoutAttempt({
        orderID,
        userId,
        status: "CAPTURE_FAILED",
        errorCode: `PAYPAL_STATUS_${status || "UNKNOWN"}`,
        errorMessage: "PayPal no devolvio el pago como completado.",
        details: { paypalStatus: status || null },
      });
      return res.status(400).json({ message: "El pago de PayPal no se completo." });
    }

    paypalCaptured = true;
    await updatePaypalCheckoutAttempt({
      orderID,
      userId,
      status: "PAYPAL_COMPLETED",
      paypalCaptureId: paypalPaymentId.toString(),
      details: { paypalStatus: status },
    });

    if (parsedCustomId?.type === "featured_offer") {
      const [, offerId] = customId.split("_");
      const featuredUntil = new Date();
      featuredUntil.setDate(featuredUntil.getDate() + 7);

      await db.query(
        `UPDATE ofertas_laborales
         SET is_featured = 1, featured_until = @featuredUntil
         WHERE id = @offerId`,
        {
          offerId: parseInt(offerId, 10),
          featuredUntil,
        },
      );
      await updatePaypalCheckoutAttempt({
        orderID,
        userId,
        status: "COMPLETED",
        paypalCaptureId: paypalPaymentId.toString(),
      });
      return res.json({ success: true });
    }

    let plan;
    let cycle = req.body.billingCycle;
    let internalSubscriptionId = null;

    if (parsedCustomId?.type === "subscription") {
      const subscriptionResult = await db.query(
        "SELECT id, plan FROM suscripciones WHERE id = @id AND id_usuario = @userId",
        { id: parsedCustomId.subscriptionId, userId },
      );
      if (subscriptionResult.rows.length === 0) {
        await updatePaypalCheckoutAttempt({
          orderID,
          userId,
          status: "PROCESSING_ERROR",
          errorCode: "SUBSCRIPTION_NOT_FOUND",
          errorMessage: "El pago se capturo, pero no se encontro la suscripcion interna.",
        });
        return res.status(400).json({ message: "Suscripcion interna no encontrada." });
      }
      internalSubscriptionId = subscriptionResult.rows[0].id;
      plan = subscriptionResult.rows[0].plan;
    } else if (parsedCustomId?.type === "legacy_subscription") {
      plan = parsedCustomId.plan;
      cycle = parsedCustomId.cycle;
    } else {
      await updatePaypalCheckoutAttempt({
        orderID,
        userId,
        status: "PROCESSING_ERROR",
        errorCode: "INVALID_CUSTOM_ID",
        errorMessage: "El pago se capturo, pero su referencia interna no es valida.",
      });
      return res.status(400).json({
        message: "Los datos del plan de suscripcion no son validos.",
      });
    }

    if (!VALID_SUBSCRIPTION_PLANS.has(plan) || !VALID_BILLING_CYCLES.has(cycle)) {
      await updatePaypalCheckoutAttempt({
        orderID,
        userId,
        status: "PROCESSING_ERROR",
        errorCode: "INVALID_SUBSCRIPTION_DATA",
        errorMessage: "El pago se capturo, pero el plan o ciclo no es valido.",
      });
      return res.status(400).json({
        message: "Los datos del plan de suscripcion no son validos.",
      });
    }

    const paidAt = captureRecord?.create_time || new Date();
    const fechaFin = calculateSubscriptionEndDate(cycle, paidAt);
    const grossAmount =
      captureRecord?.amount?.value ||
      capture.result.purchase_units?.[0]?.amount?.value;
    const currency =
      captureRecord?.amount?.currency_code ||
      capture.result.purchase_units?.[0]?.amount?.currency_code ||
      "USD";

    const updatedSubscription = await db.query(
      `INSERT INTO suscripciones
        (id_usuario, id_paypal_pago, paypal_order_id, plan, fecha_fin, estado,
         metodo_pago, first_paid_at, affiliate_referral_id)
       VALUES
        (@userId, @paypalPaymentId, @orderId, @plan, @fechaFin, 'activa',
         'paypal', @paidAt, (SELECT id FROM affiliate_referrals WHERE referred_user_id = @userId))
       ON CONFLICT (id_usuario) DO UPDATE SET
        id_paypal_pago = @paypalPaymentId,
        paypal_order_id = @orderId,
        plan = @plan,
        fecha_fin = @fechaFin,
        estado = 'activa',
        metodo_pago = 'paypal',
        first_paid_at = COALESCE(suscripciones.first_paid_at, @paidAt),
        affiliate_referral_id = COALESCE(
          suscripciones.affiliate_referral_id,
          (SELECT id FROM affiliate_referrals WHERE referred_user_id = @userId)
        ),
        updated_at = NOW()
       RETURNING id`,
      {
        userId: parseInt(userId, 10),
        paypalPaymentId: paypalPaymentId.toString(),
        orderId: orderID,
        plan,
        fechaFin,
        paidAt,
      },
    );
    internalSubscriptionId = internalSubscriptionId || updatedSubscription.rows[0]?.id;

    await attachReferralToSubscription({ userId: parseInt(userId, 10) });
    if (grossAmount) {
      await createCommissionForPayment({
        userId: parseInt(userId, 10),
        paypalTransactionId: paypalPaymentId.toString(),
        paypalSubscriptionId: null,
        grossAmount: String(grossAmount),
        currency,
        paymentDate: paidAt,
      });
    }

    const userResult = await db.query("SELECT nombre, email FROM usuarios WHERE id = @userId", {
      userId: parseInt(userId, 10),
    });
    if (userResult.rows.length > 0) {
      const user = userResult.rows[0];
      sendSubscriptionConfirmationEmail(user.email, user.nombre, plan, fechaFin)
        .catch((emailError) => console.error("Failed to send subscription email for PayPal:", emailError));
    }

    await updatePaypalCheckoutAttempt({
      orderID,
      userId,
      subscriptionId: internalSubscriptionId,
      status: "COMPLETED",
      paypalCaptureId: paypalPaymentId.toString(),
    });

    res.json({ success: true, subscriptionId: internalSubscriptionId });
  } catch (error) {
    const normalizedError = normalizePaypalError(error);
    await updatePaypalCheckoutAttempt({
      orderID,
      userId,
      status: paypalCaptured ? "PROCESSING_ERROR" : "CAPTURE_FAILED",
      errorCode: normalizedError.errorCode,
      errorMessage: normalizedError.errorMessage,
      details: normalizedError.details,
    });
    console.error("Error al capturar orden de PayPal:", normalizedError);
    res.status(500).json({ message: "Error al capturar la orden de PayPal." });
  }
});

router.post("/webhook-paypal", async (req, res) => {
  const event = req.body || {};
  const paypalEventId = String(event.id || "");
  const eventType = String(event.event_type || "");
  const resourceId = String(event.resource?.id || "");

  if (!paypalEventId || !eventType) {
    return res.status(400).json({ message: "Webhook PayPal invalido." });
  }

  const client = await db.getClient();
  try {
    await client.query("BEGIN");
    const verificationStatus = await verifyPaypalWebhookSignature(req, event);
    const rawBodySha256 = req.rawBody
      ? crypto.createHash("sha256").update(req.rawBody).digest("hex")
      : null;

    const eventInsert = await client.query(
      `INSERT INTO paypal_webhook_events
        (paypal_event_id, event_type, resource_id, verification_status,
         processing_status, payload, raw_body_sha256)
       VALUES
        (@paypalEventId, @eventType, @resourceId, @verificationStatus,
         'RECEIVED', @payload, @rawBodySha256)
       ON CONFLICT (paypal_event_id) DO UPDATE SET
         updated_at = NOW()
       RETURNING *`,
      {
        paypalEventId,
        eventType,
        resourceId: resourceId || null,
        verificationStatus,
        payload: event,
        rawBodySha256,
      },
    );

    const webhookRow = eventInsert.rows[0];
    if (webhookRow.processing_status === "PROCESSED") {
      await client.query("COMMIT");
      return res.status(200).json({ ok: true, duplicate: true });
    }
    if (verificationStatus !== "VERIFIED") {
      await client.query(
        `UPDATE paypal_webhook_events
         SET processing_status = 'FAILED',
             error_message = 'Webhook no verificado',
             processed_at = NOW(),
             updated_at = NOW()
         WHERE id = @id`,
        { id: webhookRow.id },
      );
      await client.query("COMMIT");
      return res.status(202).json({ ok: false, verificationStatus });
    }

    if (eventType === "PAYMENT.SALE.COMPLETED") {
      const transactionId = extractPaypalTransactionId(event);
      const subscriptionId = extractPaypalSubscriptionId(event);
      const amount = extractPaypalSaleAmount(event);
      const subscription = subscriptionId
        ? await client.query(
            `SELECT id_usuario FROM suscripciones
             WHERE id_paypal_suscripcion = @subscriptionId OR id_paypal_pago = @subscriptionId
             LIMIT 1`,
            { subscriptionId },
          )
        : { rows: [] };

      if (subscription.rows[0] && transactionId && amount) {
        await createCommissionForPayment({
          client,
          userId: subscription.rows[0].id_usuario,
          paypalTransactionId: String(transactionId),
          paypalSubscriptionId: subscriptionId,
          paypalWebhookEventId: webhookRow.id,
          grossAmount: amount.value,
          currency: amount.currency,
          paymentDate: event.create_time || new Date(),
        });
      }
    } else if (
      eventType === "PAYMENT.SALE.REFUNDED" ||
      eventType === "PAYMENT.SALE.REVERSED"
    ) {
      const originalSaleId = extractOriginalSaleId(event) || extractPaypalTransactionId(event);
      await reverseCommissionByTransaction({
        client,
        paypalTransactionId: String(originalSaleId || ""),
        reason: eventType,
      });
    } else if (eventType.startsWith("BILLING.SUBSCRIPTION.")) {
      const subscriptionId = extractPaypalSubscriptionId(event);
      const statusMap = {
        "BILLING.SUBSCRIPTION.CREATED": "CREATED",
        "BILLING.SUBSCRIPTION.ACTIVATED": "ACTIVE",
        "BILLING.SUBSCRIPTION.UPDATED": "ACTIVE",
        "BILLING.SUBSCRIPTION.CANCELLED": "CANCELLED",
        "BILLING.SUBSCRIPTION.SUSPENDED": "SUSPENDED",
        "BILLING.SUBSCRIPTION.EXPIRED": "EXPIRED",
        "BILLING.SUBSCRIPTION.PAYMENT.FAILED": "PAYMENT_FAILED",
      };
      if (subscriptionId) {
        await client.query(
          `UPDATE suscripciones
           SET estado = @status, updated_at = NOW()
           WHERE id_paypal_suscripcion = @subscriptionId`,
          { status: statusMap[eventType] || "UPDATED", subscriptionId },
        );
      }
    }

    await client.query(
      `UPDATE paypal_webhook_events
       SET processing_status = 'PROCESSED',
           processed_at = NOW(),
           updated_at = NOW()
       WHERE id = @id`,
      { id: webhookRow.id },
    );
    await client.query("COMMIT");
    res.status(200).json({ ok: true });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error procesando webhook PayPal:", error);
    try {
      await db.query(
        `UPDATE paypal_webhook_events
         SET processing_status = 'FAILED',
             error_message = @message,
             processed_at = NOW(),
             updated_at = NOW()
         WHERE paypal_event_id = @paypalEventId`,
        {
          paypalEventId,
          message: String(error.message || "Error").slice(0, 1000),
        },
      );
    } catch (logError) {
      console.error("Error registrando fallo de webhook PayPal:", logError);
    }
    res.status(500).json({ message: "Error del servidor." });
  } finally {
    client.release();
  }
});

module.exports = router;
