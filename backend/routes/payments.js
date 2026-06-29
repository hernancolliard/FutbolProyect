const express = require("express");
const {
  sendSubscriptionConfirmationEmail,
} = require("../services/emailService");
const { MercadoPagoConfig, Preference, Payment } = require("mercadopago");
const paypal = require("@paypal/checkout-server-sdk");
const db = require("../db");
require("dotenv").config();

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
      custom_id = `${planType}-${billingCycle}`;
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

    // --- NUEVO LOG 5: Orden creada exitosamente ---
    console.log("Orden de PayPal creada con éxito. OrderID:", order.result.id);

    res.json({ orderID: order.result.id });
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

router.post("/capture-paypal-order", verificarToken, async (req, res) => {
  const { orderID } = req.body;
  const userId = req.user.id;

  const request = new paypal.orders.OrdersCaptureRequest(orderID);
  request.prefer("return=representation");

  try {
    const capture = await paypalClient.execute(request);
    const paypalPaymentId = capture.result.id;
    const status = capture.result.status;
    const customId = capture.result.purchase_units[0].custom_id;

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

module.exports = router;
