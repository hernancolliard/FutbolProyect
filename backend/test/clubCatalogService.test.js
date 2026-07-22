const test = require("node:test");
const assert = require("node:assert/strict");

const {
  normalizeClubSearchParams,
  validateCustomClubLogo,
} = require("../services/clubCatalogService");

test("normaliza la búsqueda de clubes y limita resultados", () => {
  assert.deepEqual(
    normalizeClubSearchParams({ q: "  River   Plate ", country: " Argentina ", limit: "100" }),
    { q: "River Plate", country: "Argentina", limit: 30 },
  );
  assert.equal(normalizeClubSearchParams({ limit: "0" }).limit, 1);
  assert.equal(normalizeClubSearchParams({}).limit, 20);
});

test("acepta logos personalizados seguros", () => {
  assert.doesNotThrow(() =>
    validateCustomClubLogo({ mimetype: "image/png", size: 1024 }),
  );
});

test("rechaza formatos no permitidos y archivos grandes", () => {
  assert.throws(
    () => validateCustomClubLogo({ mimetype: "image/svg+xml", size: 1024 }),
    /PNG, JPG o WebP/,
  );
  assert.throws(
    () => validateCustomClubLogo({ mimetype: "image/png", size: 6 * 1024 * 1024 }),
    /5 MB/,
  );
});
