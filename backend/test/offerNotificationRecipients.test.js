const test = require("node:test");
const assert = require("node:assert/strict");

const {
  getActiveOfferNotificationRecipients,
} = require("../services/offerNotificationRecipientsService");

test("selecciona para avisos de ofertas solo postulantes con suscripcion activa y vigente", async () => {
  let executedQuery;
  const expectedRecipients = [{ email: "suscriptor@example.com" }];
  const client = {
    query: async (query) => {
      executedQuery = query;
      return { rows: expectedRecipients };
    },
  };

  const recipients = await getActiveOfferNotificationRecipients(client);

  assert.deepEqual(recipients, expectedRecipients);
  assert.match(executedQuery, /u\.tipo_usuario\s*=\s*'postulante'/);
  assert.match(executedQuery, /s\.id_usuario\s*=\s*u\.id/);
  assert.match(executedQuery, /s\.estado\s*=\s*'activa'/);
  assert.match(executedQuery, /s\.fecha_fin\s*>\s*NOW\(\)/);
  assert.match(executedQuery, /EXISTS\s*\(/);
});
