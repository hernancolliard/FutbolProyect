const assert = require("node:assert/strict");
const test = require("node:test");

const {
  GROUP_SLOTS,
  TERCERA_GROUPS,
  mergeCatalog,
  parseArgs,
  parseIndividualClubPage,
  parseTerceraPage,
  resolveDatabaseUrl,
  slugify,
} = require("../scripts/importLaFutboltecaRFEF");

test("las 18 láminas de Tercera contienen 18 clubes", () => {
  assert.equal(TERCERA_GROUPS.length, 18);
  assert.ok(TERCERA_GROUPS.every((group) => group.length === 18));
  assert.deepEqual(GROUP_SLOTS, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 16, 17, 18]);
});

test("parsea escudos individuales y usa el título cuando falta alt", () => {
  const html = `
    <img class="size-thumbnail" src="http://www.lafutbolteca.com/wp-content/uploads/a-150x150.jpg" alt="escudo Club Águila" title="AGUILA" />
    <img class="size-thumbnail" src="http://www.lafutbolteca.com/wp-content/uploads/b-150x150.jpg" alt="" title="TARAZONA" />
  `;
  const clubs = parseIndividualClubPage(html, {
    tier: "Primera",
    group: 2,
    pageUrl: "https://lafutbolteca.com/primera-rfef-2/",
  });
  assert.deepEqual(clubs.map((club) => club.name), ["Club Águila", "TARAZONA"]);
  assert.equal(clubs[0].source_slug, "club-aguila");
  assert.match(clubs[0].logo_source_url, /^https:/);
});

test("asocia la lámina de Tercera con sus 18 posiciones", () => {
  const html = '<img src="http://www.lafutbolteca.com/wp-content/uploads/Tercera-División-RFEF-Grupo-I-2025-2026.jpg" title="Tercera División RFEF Grupo I 2025-2026" />';
  const clubs = parseTerceraPage(html, 1, "https://lafutbolteca.com/tercera/3divg1/");
  assert.equal(clubs.length, 18);
  assert.equal(clubs[0].name, "UD Somozas");
  assert.equal(clubs[17].name, "UD Barbadás");
  assert.deepEqual(clubs[15].source_metadata.crop, { slot: 16, columns: 5, rows: 4 });
});

test("el merge reutiliza clubes españoles que ya existen", () => {
  const incoming = [{
    source: "lafutbolteca",
    source_slug: "racing-club-ferrol",
    name: "Racing Club Ferrol",
    country: "España",
    country_slug: "espana",
    league: "Primera RFEF - Grupo 1",
    logo_url: "/new.webp",
  }];
  const existingManifest = {
    clubs: [{
      source: "footylogos",
      source_slug: "racing-de-ferrol",
      name: "Racing de Ferrol",
      country: "España",
      country_slug: "espana",
      league: "Primera Federación (España)",
      logo_url: "/existing.webp",
    }],
  };
  const result = mergeCatalog(existingManifest, incoming);
  assert.equal(result.accepted.length, 0);
  assert.equal(result.reused.length, 1);
  assert.equal(result.clubs.length, 1);
});

test("valida argumentos y normaliza slugs", () => {
  assert.equal(slugify("Peña Balsamaiso C.F."), "pena-balsamaiso-c-f");
  assert.deepEqual(parseArgs(["--no-download", "--delay", "750", "--limit", "2"]), {
    download: false,
    forceDownload: false,
    db: false,
    dryRun: false,
    dbOnly: false,
    delay: 750,
    limit: 2,
  });
  assert.throws(() => parseArgs(["--delay", "100"]), /700/);
  assert.equal(
    new URL(resolveDatabaseUrl("postgres://user:pass@internal-host/db", "oregon")).hostname,
    "internal-host.oregon-postgres.render.com",
  );
});
