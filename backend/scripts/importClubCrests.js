#!/usr/bin/env node

const fs = require("node:fs/promises");
const path = require("node:path");
const { Pool } = require("pg");

require("dotenv").config({
  path: path.resolve(__dirname, "../.env"),
  quiet: true,
});

const SOURCE = "footylogos";
const SOURCE_ORIGIN = "https://www.footylogos.com";
const ATTRIBUTION = "Escudos obtenidos de FootyLogos.com; marcas de sus respectivos propietarios.";
const DEFAULT_PUBLIC_ROOT = path.resolve(
  __dirname,
  "../../futbolproyect-nextjs/public/images/club-crests",
);
const DEFAULT_MANIFEST_ROOT = path.resolve(__dirname, "../../data/club-crests");
const MIGRATION_PATH = path.resolve(__dirname, "../../create_football_clubs.sql");

function printHelp() {
  console.log(`
Importa clubes y escudos desde las páginas públicas por país de FootyLogos.

Uso:
  node backend/scripts/importClubCrests.js [opciones]

Opciones:
  --countries argentina,spain  Slugs de país separados por coma (default: argentina)
  --download                   Descarga los escudos WebP al frontend (default)
  --no-download                Solo guarda metadatos y URL de origen
  --force-download             Reemplaza también los escudos que ya existen
  --db                         Crea/actualiza registros usando DATABASE_URL
  --dry-run                    Consulta y valida sin escribir archivos ni base de datos
  --delay 1000                 Pausa mínima entre solicitudes, en ms (mínimo: 500)
  --limit 10                   Limita la cantidad total de clubes (útil para pruebas)
  --help                       Muestra esta ayuda

Ejemplos:
  node backend/scripts/importClubCrests.js --dry-run --limit 5
  node backend/scripts/importClubCrests.js --countries argentina,uruguay --db
  node backend/scripts/importClubCrests.js --countries argentina --no-download --db
`);
}

function parseArgs(argv) {
  const options = {
    countries: ["argentina"],
    download: true,
    forceDownload: false,
    db: false,
    dryRun: false,
    delay: 900,
    limit: null,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--countries") {
      options.countries = String(argv[++index] || "")
        .split(",")
        .map((value) => value.trim().toLowerCase())
        .filter(Boolean);
    } else if (argument === "--download") {
      options.download = true;
    } else if (argument === "--no-download") {
      options.download = false;
    } else if (argument === "--force-download") {
      options.forceDownload = true;
    } else if (argument === "--db") {
      options.db = true;
    } else if (argument === "--dry-run") {
      options.dryRun = true;
    } else if (argument === "--delay") {
      options.delay = Number(argv[++index]);
    } else if (argument === "--limit") {
      options.limit = Number(argv[++index]);
    } else if (argument === "--help" || argument === "-h") {
      options.help = true;
    } else {
      throw new Error(`Opción desconocida: ${argument}`);
    }
  }

  if (!options.countries.length) {
    throw new Error("Debés indicar al menos un país en --countries.");
  }
  if (options.countries.some((slug) => !/^[a-z0-9-]+$/.test(slug))) {
    throw new Error("Los países deben ser slugs simples, por ejemplo: argentina,spain.");
  }
  if (!Number.isFinite(options.delay) || options.delay < 500) {
    throw new Error("--delay debe ser un número igual o mayor que 500 ms.");
  }
  if (
    options.limit !== null &&
    (!Number.isInteger(options.limit) || options.limit < 1)
  ) {
    throw new Error("--limit debe ser un entero positivo.");
  }

  return options;
}

function decodeHtml(value) {
  const namedEntities = {
    amp: "&",
    apos: "'",
    gt: ">",
    lt: "<",
    nbsp: " ",
    quot: '"',
  };

  return String(value || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, entity) => {
      if (entity[0] === "#") {
        const hexadecimal = entity[1].toLowerCase() === "x";
        const codePoint = Number.parseInt(entity.slice(hexadecimal ? 2 : 1), hexadecimal ? 16 : 10);
        return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : match;
      }
      return namedEntities[entity.toLowerCase()] ?? match;
    })
    .replace(/\s+/g, " ")
    .trim();
}

function parseCountryName(html, countrySlug) {
  const titleMatch = html.match(/<h1[^>]*>[\s\S]*?Logos de fútbol de\s+(.+?)\s+en SVG y PNG[\s\S]*?<\/h1>/i);
  if (titleMatch) return decodeHtml(titleMatch[1]);

  return countrySlug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function parseClubCards(html, countrySlug) {
  const firstHeadingMarker = html.search(/Todos los escudos de equipos de/i);
  if (firstHeadingMarker === -1) {
    throw new Error(`No se encontró el listado de clubes para ${countrySlug}.`);
  }
  const headingStart = html.lastIndexOf("<h2", firstHeadingMarker);
  const start = headingStart === -1 ? firstHeadingMarker : headingStart;

  const endMatch = html.slice(start).search(/Escudos por competiciones/i);
  const end = endMatch === -1 ? html.length : start + endMatch;
  const clubRegion = html.slice(start, end);
  const country = parseCountryName(html, countrySlug);
  const tokenPattern = /<h2[^>]*>[\s\S]*?Todos los escudos de equipos de\s+([\s\S]*?)<\/h2>|<a\s+href="(\/es\/logos\/([a-z0-9-]+))"[^>]*>[\s\S]*?<img\s+[^>]*src="(https:\/\/assets\.footylogos\.com\/previews\/[^"]+)"[^>]*>[\s\S]*?<h3[^>]*class="logo-name"[^>]*>([\s\S]*?)<\/h3>[\s\S]*?<\/a>/gi;
  const clubs = [];
  const seen = new Set();
  let currentLeague = null;
  let match;

  while ((match = tokenPattern.exec(clubRegion)) !== null) {
    if (match[1]) {
      currentLeague = decodeHtml(match[1]);
      continue;
    }

    const [, , relativePageUrl, sourceSlug, logoSourceUrl, rawName] = match;
    if (seen.has(sourceSlug)) continue;
    seen.add(sourceSlug);

    clubs.push({
      source: SOURCE,
      source_slug: sourceSlug,
      name: decodeHtml(rawName),
      country,
      country_slug: countrySlug,
      league: currentLeague,
      logo_url: null,
      logo_source_url: logoSourceUrl,
      source_page_url: new URL(relativePageUrl, SOURCE_ORIGIN).href,
      attribution: ATTRIBUTION,
      usage_context: "identification/editorial/reference",
    });
  }

  if (!clubs.length) {
    throw new Error(`La página de ${countrySlug} no produjo clubes; es posible que su HTML haya cambiado.`);
  }

  return clubs;
}

function parseRobotsTxt(robotsText) {
  const groups = [];
  let agents = [];
  let rules = [];

  const flush = () => {
    if (agents.length) groups.push({ agents, rules });
    agents = [];
    rules = [];
  };

  for (const rawLine of String(robotsText).split(/\r?\n/)) {
    const line = rawLine.replace(/#.*$/, "").trim();
    if (!line) continue;
    const separator = line.indexOf(":");
    if (separator === -1) continue;
    const field = line.slice(0, separator).trim().toLowerCase();
    const value = line.slice(separator + 1).trim();

    if (field === "user-agent") {
      if (rules.length) flush();
      agents.push(value.toLowerCase());
    } else if (field === "disallow" && agents.length) {
      rules.push(value);
    }
  }
  flush();

  return groups
    .filter((group) => group.agents.includes("*") || group.agents.some((agent) => agent.includes("futbolproyect")))
    .flatMap((group) => group.rules)
    .filter(Boolean);
}

function assertRobotsAllows(disallowedPaths, targetUrl) {
  const pathname = new URL(targetUrl).pathname;
  const blocked = disallowedPaths.some((rule) => {
    const prefix = rule.replace(/\*.*$/, "").replace(/\$$/, "");
    return prefix && pathname.startsWith(prefix);
  });
  if (blocked) {
    throw new Error(`robots.txt no permite consultar ${pathname}.`);
  }
}

function createRateLimitedFetcher(delayMs) {
  let lastRequestAt = 0;

  return async function fetchWithRetry(url, responseType = "text") {
    let lastError;
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      const waitMs = Math.max(0, delayMs - (Date.now() - lastRequestAt));
      if (waitMs) await new Promise((resolve) => setTimeout(resolve, waitMs));
      lastRequestAt = Date.now();

      try {
        const response = await fetch(url, {
          headers: {
            Accept: responseType === "buffer" ? "image/webp,image/*;q=0.8" : "text/html, text/plain;q=0.9",
            "User-Agent": "FutbolProyectClubImporter/1.0 (+https://futbolproyect.com)",
          },
          redirect: "follow",
          signal: AbortSignal.timeout(20_000),
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return responseType === "buffer"
          ? { buffer: Buffer.from(await response.arrayBuffer()), contentType: response.headers.get("content-type") || "" }
          : await response.text();
      } catch (error) {
        lastError = error;
        if (attempt < 3) await new Promise((resolve) => setTimeout(resolve, attempt * 750));
      }
    }
    const detail = lastError?.cause?.message || lastError?.message || "error desconocido";
    throw new Error(`No se pudo descargar ${url}: ${detail}`);
  };
}

async function downloadCrest(club, fetchResource, publicRoot, forceDownload = false) {
  const countryDirectory = path.join(publicRoot, club.country_slug);
  const filePath = path.join(countryDirectory, `${club.source_slug}.webp`);
  const publicUrl = `/images/club-crests/${club.country_slug}/${club.source_slug}.webp`;

  if (!forceDownload) {
    try {
      await fs.access(filePath);
      return publicUrl;
    } catch {
      // El archivo no existe todavía; continúa con la descarga.
    }
  }

  const { buffer, contentType } = await fetchResource(club.logo_source_url, "buffer");

  if (!contentType.toLowerCase().startsWith("image/")) {
    throw new Error(`Respuesta no válida para ${club.name}: ${contentType || "sin Content-Type"}`);
  }
  if (buffer.length > 5 * 1024 * 1024) {
    throw new Error(`El escudo de ${club.name} supera el límite de 5 MB.`);
  }

  await fs.mkdir(countryDirectory, { recursive: true });
  await fs.writeFile(filePath, buffer);
  return publicUrl;
}

function csvEscape(value) {
  const text = value === null || value === undefined ? "" : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function clubsToCsv(clubs) {
  const columns = [
    "source",
    "source_slug",
    "name",
    "country",
    "country_slug",
    "league",
    "logo_url",
    "logo_source_url",
    "source_page_url",
    "attribution",
    "usage_context",
  ];
  return [
    columns.join(","),
    ...clubs.map((club) => columns.map((column) => csvEscape(club[column])).join(",")),
  ].join("\n");
}

async function writeManifests(clubs, countries, manifestRoot) {
  await fs.mkdir(manifestRoot, { recursive: true });
  const manifest = {
    generated_at: new Date().toISOString(),
    source: SOURCE_ORIGIN,
    countries,
    count: clubs.length,
    clubs,
  };
  await Promise.all([
    fs.writeFile(path.join(manifestRoot, "clubs.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8"),
    fs.writeFile(path.join(manifestRoot, "clubs.csv"), `${clubsToCsv(clubs)}\n`, "utf8"),
  ]);
}

async function upsertClubs(clubs) {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL no está definida; no se puede usar --db.");
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 10_000,
  });
  const client = await pool.connect();

  try {
    const migration = await fs.readFile(MIGRATION_PATH, "utf8");
    await client.query("BEGIN");
    await client.query(migration);

    for (const club of clubs) {
      await client.query(
        `INSERT INTO football_clubs (
          source, source_slug, name, country, country_slug, league,
          logo_url, logo_source_url, source_page_url, attribution,
          usage_context, source_metadata, is_active
        ) VALUES (
          $1, $2, $3, $4, $5, $6,
          $7, $8, $9, $10,
          $11, $12::jsonb, TRUE
        )
        ON CONFLICT (source, source_slug) DO UPDATE SET
          name = EXCLUDED.name,
          country = EXCLUDED.country,
          country_slug = EXCLUDED.country_slug,
          league = EXCLUDED.league,
          logo_url = COALESCE(EXCLUDED.logo_url, football_clubs.logo_url),
          logo_source_url = EXCLUDED.logo_source_url,
          source_page_url = EXCLUDED.source_page_url,
          attribution = EXCLUDED.attribution,
          usage_context = EXCLUDED.usage_context,
          source_metadata = EXCLUDED.source_metadata,
          is_active = TRUE`,
        [
          club.source,
          club.source_slug,
          club.name,
          club.country,
          club.country_slug,
          club.league,
          club.logo_url,
          club.logo_source_url,
          club.source_page_url,
          club.attribution,
          club.usage_context,
          JSON.stringify({ imported_at: new Date().toISOString() }),
        ],
      );
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

async function run(options) {
  const fetchResource = createRateLimitedFetcher(options.delay);
  const robotsUrl = `${SOURCE_ORIGIN}/robots.txt`;
  const robotsText = await fetchResource(robotsUrl);
  const disallowedPaths = parseRobotsTxt(robotsText);
  let clubs = [];

  for (const countrySlug of options.countries) {
    const countryUrl = `${SOURCE_ORIGIN}/es/country/${countrySlug}`;
    assertRobotsAllows(disallowedPaths, countryUrl);
    const html = await fetchResource(countryUrl);
    const countryClubs = parseClubCards(html, countrySlug);
    clubs.push(...countryClubs);
    console.log(`${countryClubs.length} clubes encontrados en ${countryClubs[0].country}.`);
  }

  const uniqueClubs = new Map(clubs.map((club) => [`${club.source}:${club.source_slug}`, club]));
  clubs = [...uniqueClubs.values()];
  if (options.limit !== null) clubs = clubs.slice(0, options.limit);

  if (options.dryRun) {
    console.log(`Dry run correcto: ${clubs.length} clubes validados; no se escribió ningún archivo.`);
    console.table(clubs.slice(0, 10).map(({ name, country, league }) => ({ name, country, league })));
    return clubs;
  }

  if (options.download) {
    let downloaded = 0;
    for (const club of clubs) {
      try {
        club.logo_url = await downloadCrest(
          club,
          fetchResource,
          DEFAULT_PUBLIC_ROOT,
          options.forceDownload,
        );
        downloaded += 1;
      } catch (error) {
        console.warn(`Aviso: ${error.message}`);
      }
    }
    console.log(`${downloaded}/${clubs.length} escudos descargados.`);
  }

  await writeManifests(clubs, options.countries, DEFAULT_MANIFEST_ROOT);
  console.log(`Manifiestos escritos en ${DEFAULT_MANIFEST_ROOT}.`);

  if (options.db) {
    await upsertClubs(clubs);
    console.log(`${clubs.length} clubes insertados o actualizados en PostgreSQL.`);
  }

  return clubs;
}

async function main() {
  try {
    const options = parseArgs(process.argv.slice(2));
    if (options.help) {
      printHelp();
      return;
    }
    await run(options);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exitCode = 1;
  }
}

if (require.main === module) main();

module.exports = {
  assertRobotsAllows,
  clubsToCsv,
  decodeHtml,
  parseArgs,
  parseClubCards,
  parseCountryName,
  parseRobotsTxt,
  run,
};
