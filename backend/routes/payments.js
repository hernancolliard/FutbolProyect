const express = require("express");
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
      unit_price = planResult.rows[0].price_mp;
      title = `Suscripción ${planType} - ${billingCycle}`;
    } else if (planType === "destacar_oferta") {
      title = "Destacar Oferta";
      unit_price = 1000; // Still hardcoded for featured offer
      description = planType;
    } else {
      return res.status(400).json({ message: "Tipo de plan no válido." });
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
          },
        ],
        external_reference:
          planType === "destacar_oferta"
            ? `${userId}_${req.body.offerId}`
            : userId.toString(),
        back_urls: {
          success: `${process.env.FRONTEND_URL}/pago-exitoso-mp`,
          failure: `${process.env.FRONTEND_URL}/pago-cancelado-mp`,
          pending: `${process.env.FRONTEND_URL}/pago-pendiente-mp`,
        },
        notification_url: `${process.env.BACKEND_URL}/payments/webhook-mp`,
      },
    });
    res.json({ init_point: response.init_point, preferenceId: response.id });
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

      const userId = payment.external_reference;
      const status = payment.status;
      const description = payment.description;

      if (status === "approved") {
        const [plan, cycle] = description.split("-");

        if (plan === "destacar_oferta") {
          const [parsedUserId, offerId] = userId.split("_");
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
          const fechaFin = new Date();
          if (cycle === "monthly") {
            fechaFin.setMonth(fechaFin.getMonth() + 1);
          } else if (cycle === "annual") {
            fechaFin.setFullYear(fechaFin.getFullYear() + 1);
          }

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
            userId: parseInt(userId, 10),
            paymentId: paymentId.toString(),
            plan,
            fechaFin,
          });
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
    let custom_id = `${planType}-${billingCycle}`;

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
        const fechaFin = new Date();
        if (cycle === "monthly") {
          fechaFin.setMonth(fechaFin.getMonth() + 1);
        } else if (cycle === "annual") {
          fechaFin.setFullYear(fechaFin.getFullYear() + 1);
        }

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
