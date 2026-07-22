const test = require("node:test");
const assert = require("node:assert/strict");

const {
  assertRobotsAllows,
  clubsToCsv,
  decodeHtml,
  parseArgs,
  parseClubCards,
  parseRobotsTxt,
} = require("../scripts/importClubCrests");

const card = (slug, name) => `
  <a href="/es/logos/${slug}" class="link-block-15 new w-inline-block">
    <div><img src="https://assets.footylogos.com/previews/${slug}/${slug}-logo-footylogos-320.webp" alt="${name} logo"></div>
    <h3 class="logo-name">${name}</h3>
  </a>`;

test("parseClubCards toma solo las secciones de clubes y conserva la liga", () => {
  const html = `
    <h1>Logos de fútbol de Argentina en SVG y PNG</h1>
    <h2>Escudo de la selección nacional de Argentina</h2>
    ${card("argentina-national-team", "Selección Argentina")}
    <h2>Todos los escudos de equipos de Liga Profesional (Argentina)</h2>
    ${card("boca-juniors", "Boca Juniors")}
    ${card("newells-old-boys", "Newell&#39;s Old Boys")}
    <h2>Todos los escudos de equipos de Primera Nacional (Argentina)</h2>
    ${card("club-atletico-colon", "Colón")}
    <div>Escudos por competiciones</div>
    ${card("premier-league", "Premier League")}
  `;

  const clubs = parseClubCards(html, "argentina");
  assert.equal(clubs.length, 3);
  assert.deepEqual(
    clubs.map(({ name, country, league }) => ({ name, country, league })),
    [
      { name: "Boca Juniors", country: "Argentina", league: "Liga Profesional (Argentina)" },
      { name: "Newell's Old Boys", country: "Argentina", league: "Liga Profesional (Argentina)" },
      { name: "Colón", country: "Argentina", league: "Primera Nacional (Argentina)" },
    ],
  );
});

test("decodeHtml interpreta entidades nombradas y numéricas", () => {
  assert.equal(decodeHtml("Newell&#39;s &amp; Col&oacute;n"), "Newell's & Col&oacute;n");
  assert.equal(decodeHtml("Espa&#241;a"), "España");
});

test("clubsToCsv protege comas y comillas", () => {
  const csv = clubsToCsv([{
    source: "footylogos",
    source_slug: "demo",
    name: 'Club "Demo", FC',
    country: "Argentina",
    country_slug: "argentina",
    league: null,
    logo_url: null,
    logo_source_url: "https://example.com/logo.webp",
    source_page_url: "https://example.com/demo",
    attribution: "Fuente",
    usage_context: "identification/editorial/reference",
  }]);
  assert.match(csv, /"Club ""Demo"", FC"/);
});

test("parseArgs aplica límites conservadores", () => {
  assert.throws(() => parseArgs(["--delay", "100"]), /500 ms/);
  assert.deepEqual(parseArgs(["--countries", "argentina,uruguay", "--no-download"]).countries, ["argentina", "uruguay"]);
});

test("robots.txt puede bloquear una ruta", () => {
  const rules = parseRobotsTxt("User-agent: *\nDisallow: /es/country/private\n");
  assert.throws(
    () => assertRobotsAllows(rules, "https://www.footylogos.com/es/country/private"),
    /no permite/,
  );
});
