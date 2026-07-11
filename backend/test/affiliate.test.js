process.env.DATABASE_URL = process.env.DATABASE_URL || "postgres://user:pass@localhost:5432/test";
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";
process.env.AFFILIATE_COOKIE_SECRET = "affiliate-test-secret";

const test = require("node:test");
const assert = require("node:assert/strict");

const {
  createAffiliateCookieValue,
  verifyAffiliateCookieValue,
} = require("../services/affiliateCookieService");
const {
  addDecimalStrings,
  calculateCommissionAmount,
} = require("../services/affiliateService");
const {
  extractPaypalSubscriptionId,
  extractPaypalTransactionId,
  extractPaypalSaleAmount,
  extractOriginalSaleId,
} = require("../services/paypalPayloadService");
const { convertNamedQuery } = require("../queryParams");

test("convierte parametros nombrados sin perder valores", () => {
  assert.deepEqual(
    convertNamedQuery(
      "DELETE FROM usuarios WHERE id = @id OR referido_por = @id",
      { id: 149 },
    ),
    {
      text: "DELETE FROM usuarios WHERE id = $1 OR referido_por = $1",
      values: [149],
    },
  );
});

test("mantiene parametros posicionales nativos de pg", () => {
  assert.deepEqual(convertNamedQuery("SELECT * FROM usuarios WHERE id = $1", [149]), {
    text: "SELECT * FROM usuarios WHERE id = $1",
    values: [149],
  });
});

test("crea y verifica cookie firmada", () => {
  const issuedAt = Date.UTC(2026, 6, 10);
  const value = createAffiliateCookieValue({
    affiliateId: 10,
    clickId: 22,
    issuedAt,
    maxAgeDays: 60,
  });
  const payload = verifyAffiliateCookieValue(value, issuedAt + 1000);
  assert.equal(payload.affiliateId, 10);
  assert.equal(payload.clickId, 22);
});

test("rechaza cookie modificada", () => {
  const value = createAffiliateCookieValue({ affiliateId: 1, clickId: 2 });
  const [encoded, signature] = value.split(".");
  const replacement = signature[0] === "A" ? "B" : "A";
  const tampered = `${encoded}.${replacement}${signature.slice(1)}`;
  assert.equal(verifyAffiliateCookieValue(tampered), null);
});

test("rechaza cookie vencida", () => {
  const issuedAt = Date.UTC(2026, 0, 1);
  const value = createAffiliateCookieValue({
    affiliateId: 1,
    clickId: 2,
    issuedAt,
    maxAgeDays: 1,
  });
  assert.equal(verifyAffiliateCookieValue(value, issuedAt + 2 * 24 * 60 * 60 * 1000), null);
});

test("calcula comision con redondeo monetario", () => {
  assert.equal(calculateCommissionAmount("10.00", "20"), "2.00");
  assert.equal(calculateCommissionAmount("10.01", "12.5"), "1.25");
  assert.equal(calculateCommissionAmount("0.05", "10"), "0.01");
});

test("suma importes decimales sin usar float", () => {
  assert.equal(addDecimalStrings(["0.10", "0.20", "1.05"]), "1.35");
});

test("extrae campos de payload PayPal sale", () => {
  const event = {
    resource: {
      id: "SALE-1",
      billing_agreement_id: "SUB-1",
      amount: { total: "29.90", currency: "USD" },
      sale_id: "ORIGINAL-SALE",
    },
  };
  assert.equal(extractPaypalTransactionId(event), "SALE-1");
  assert.equal(extractPaypalSubscriptionId(event), "SUB-1");
  assert.deepEqual(extractPaypalSaleAmount(event), { value: "29.90", currency: "USD" });
  assert.equal(extractOriginalSaleId(event), "ORIGINAL-SALE");
});
