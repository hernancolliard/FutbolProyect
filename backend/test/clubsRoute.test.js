process.env.DATABASE_URL =
  process.env.DATABASE_URL || "postgres://user:pass@localhost:5432/test";
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";

const test = require("node:test");
const assert = require("node:assert/strict");
const express = require("express");

const db = require("../db");
const clubsRouter = require("../routes/clubs");

const startTestServer = async () => {
  const app = express();
  app.use("/api/clubs", clubsRouter);
  const server = await new Promise((resolve) => {
    const instance = app.listen(0, "127.0.0.1", () => resolve(instance));
  });
  const address = server.address();
  return {
    server,
    baseUrl: `http://127.0.0.1:${address.port}`,
  };
};

test("GET /api/clubs devuelve resultados normalizados", async (t) => {
  const originalQuery = db.query;
  let receivedParams;
  db.query = async (_query, params) => {
    receivedParams = params;
    return {
      rows: [
        {
          id: "34",
          name: "River Plate",
          country: "Argentina",
          country_slug: "argentina",
          league: "Liga Profesional (Argentina)",
          logo_url: "/images/club-crests/argentina/river-plate.webp",
        },
      ],
    };
  };

  const { server, baseUrl } = await startTestServer();
  t.after(() => {
    db.query = originalQuery;
    server.close();
  });

  const response = await fetch(`${baseUrl}/api/clubs?q=River%20Plate&limit=5`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body[0].id, 34);
  assert.equal(body[0].name, "River Plate");
  assert.equal(receivedParams.exact, "River Plate");
  assert.equal(receivedParams.limit, 5);
});

test("GET /api/clubs no consulta la base con menos de dos caracteres", async (t) => {
  const originalQuery = db.query;
  let queryCalled = false;
  db.query = async () => {
    queryCalled = true;
    return { rows: [] };
  };

  const { server, baseUrl } = await startTestServer();
  t.after(() => {
    db.query = originalQuery;
    server.close();
  });

  const response = await fetch(`${baseUrl}/api/clubs?q=R`);
  assert.deepEqual(await response.json(), []);
  assert.equal(queryCalled, false);
});

test("POST /api/clubs/custom-logo exige autenticación", async (t) => {
  const { server, baseUrl } = await startTestServer();
  t.after(() => server.close());

  const response = await fetch(`${baseUrl}/api/clubs/custom-logo`, {
    method: "POST",
  });
  assert.equal(response.status, 401);
});
