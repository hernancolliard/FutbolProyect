#!/usr/bin/env node

const fs = require("node:fs/promises");
const http = require("node:http");
const https = require("node:https");
const path = require("node:path");
const sharp = require("sharp");
const { Pool } = require("pg");

require("dotenv").config({
  path: path.resolve(__dirname, "../.env"),
  quiet: true,
});

const SOURCE = "lafutbolteca";
const SOURCE_ORIGIN = "https://lafutbolteca.com";
const SEASON = "2025/26";
const COUNTRY = "España";
const COUNTRY_SLUG = "espana";
const ATTRIBUTION =
  "Escudos obtenidos de LaFutbolteca.com; marcas de sus respectivos propietarios.";
const PUBLIC_ROOT = path.resolve(
  __dirname,
  "../../futbolproyect-nextjs/public/images/club-crests/espana",
);
const MANIFEST_ROOT = path.resolve(__dirname, "../../data/club-crests");
const MIGRATION_PATH = path.resolve(__dirname, "../../create_football_clubs.sql");
const GROUP_SLOTS = [...Array(15).keys(), 16, 17, 18];

// Orden visual de las láminas de La Futbolteca: 5 + 5 + 5 + 3 clubes.
const TERCERA_GROUPS = [
  [
    "UD Somozas", "Racing Club Villalbés", "Silva SD", "Céltiga FC", "CD Lugo Polvorín",
    "Atlético Arteixo", "CD Boiro", "Juventud Cambados", "Arosa SC", "CD Barco",
    "Viveiro CF", "Atlético Coruña Montañeros", "SD Compostela", "CD Estradense", "Alondras CF",
    "Gran Peña FC", "CF Noia", "UD Barbadás",
  ],
  [
    "UD Gijón Industrial", "UC Ceares", "Avilés Stadium CF", "EI San Martín", "Club Siero",
    "CD Tuilla", "Real Titánico", "Sporting Atlético", "CD Praviano", "SD Navarro CF",
    "L'Entregu CF", "CD Llanes", "CD Colunga", "CD Mosconia", "SD Lenense",
    "UD Llanera", "CD Covadonga", "Caudal Deportivo",
  ],
  [
    "CF Vimenor", "CD Barquereño", "Castro FC", "SD Noja", "CD Tropezón",
    "CD Guarnizo", "SD Torina", "CD Revilla", "RS Gimnástica Torrelavega", "UC Cartes",
    "Selaya FC", "SD Atlético Albericia", "CD Montañas del Pas", "CD Laredo", "UM Escobedo",
    "CD Cayón", "Centro Deportivo Bezana", "CD Colindres",
  ],
  [
    "CD Aurrerá de Vitoria", "SD Zamudio", "CD Santurtzi", "CD San Ignacio", "Pasaia KE",
    "Deportivo Alavés C", "SD Leioa", "Club Portugalete", "SD Deusto", "UDA Aretxabaleta",
    "CD Lagun Onak", "Real Sociedad C", "Cultural Durango", "Zarautz KE", "Añorga KKE",
    "CD Derio", "SD Eibar C", "CD Touring",
  ],
  [
    "CP San Cristóbal", "CE L'Hospitalet", "UE Vic", "CF Can Vidalet", "FE Grama",
    "CF Peralada", "Cerdanyola FC", "Lleida CF", "CE Manresa", "CF Montañesa",
    "CF Vilanova i la Geltrú", "UE Vilassar", "UE Tona", "CE Europa B", "CF Badalona",
    "UE Cornellà", "CFJ Mollerussa", "FC L'Escala",
  ],
  [
    "CD Roda", "UD Alzira", "Villarreal CF C", "CF La Nucía", "Atlético Levante",
    "Atlético Saguntino", "Crevillente Deportivo", "CF Recambios Colón Catarroja", "UD Castellonense", "Ontinyent 1931 CF",
    "Atzeneta UE", "Athletic Club Torrellano", "CD Utiel", "CD Buñol", "Hércules CF B",
    "UD Vall de Uxó", "CD Soneja", "FC Jove Español San Vicente",
  ],
  [
    "México FC", "Atlético de Madrid C", "CD Galapagar", "AD Unión Adarve", "Siello FC",
    "AD Torrejón CF", "Racing Madrid FC", "CF Pozuelo", "CD Móstoles URJC", "Las Rozas CF",
    "CD Leganés B", "San Sebastián de los Reyes B", "SAD Villaverde San Andrés", "CF Trival Valderas", "CDF Tres Cantos",
    "RCD Carabanchel", "AD Alcorcón B", "AD Parla",
  ],
  [
    "CD Becerril", "Palencia CF", "Betis CF Valladolid", "UD Santa Marta", "Júpiter Leonés B",
    "CD Guijuelo", "CD La Virgen del Camino", "CD Atlético Tordesillas", "Unionistas de Salamanca CF B", "CD Numancia B",
    "CD Mojados", "SD Almazán", "CD Atlético Mansillés", "Arandina CF", "CD Villaralbo",
    "Palencia Cristo Atlético", "CD Colegios Diocesanos", "CD Mirandés B",
  ],
  [
    "Club Recreativo Granada", "UD Ciudad de Torredonjimeno", "Churriana de la Vega CF", "CD Huétor Vega", "Atlético Porcuna CF",
    "FC Marbellí", "CD Huétor Tájar", "UD Torre del Mar", "CD Torreperogil", "CD Alhaurino",
    "CF Motril", "CP Mijas-Las Lagunas", "Martos CD", "Arenas de Armilla CyD", "El Palo FC",
    "UD Melilla B", "Atlético Mancha Real", "UD San Pedro",
  ],
  [
    "UD Tomares", "AD Ceuta FC B", "Dos Hermanas CF 1971", "Bollullos CF", "CD San Roque de Lepe",
    "Atlético Onubense", "CD Utrera", "Conil CF", "Coria CF", "Cádiz CF Mirandilla",
    "Chiclana CF", "CD Ciudad de Lucena", "Sevilla FC C", "Real Balompédica Linense", "CD Pozoblanco",
    "Castilleja CF", "Club Atlético Central", "Córdoba CF B",
  ],
  [
    "CE Constància", "SCR Peña Deportiva", "UD Rotlet Molinar", "CD Manacor", "CD Son Cladera",
    "RCD Mallorca B", "CD Cardassar", "CE Mercadal", "CE Felanitx", "Inter Ibiza CD",
    "CD Binissalem", "UE Alcúdia", "CD Llosetense", "CE Santanyí", "CF Platges de Calvià",
    "SE Penya Independent", "SD Formentera", "UD Collerense",
  ],
  [
    "UD Telde", "CD Arcángel San Miguel", "UD Las Palmas C", "CD Atlético Paso", "UD Villa de Santa Brígida",
    "CD Santa Úrsula", "Arucas CF", "CD Tenerife C", "CF Panadería Pulido San Mateo", "UD Tamaraceite",
    "CD Mensajero", "UD San Fernando", "San Bartolomé CF", "SD Tenisca", "CD Marino",
    "CD Herbania", "CD Unión Sur Yaiza", "UD Lanzarote",
  ],
  [
    "Atlético Santa Cruz", "Atlético Pulpileño", "UD Caravaca", "Mazarrón FC", "Muleño CF",
    "Águilas FC B", "Real Murcia Imperial", "Unión Molinense FC", "Estrella Grana El Palmar CF", "UCAM Murcia CF B",
    "Olímpico de Totana", "CD Cieza", "FC Cartagena B", "SFC Minerva", "CD Bala Azul",
    "CAP Ciudad de Murcia", "Yeclano Deportivo B", "Deportivo Marítimo",
  ],
  [
    "CA Pueblonuevo", "SP Villafranca", "UD Montijo", "EF Puebla de la Calzada", "Moralo CP",
    "CD Calamonte", "CD Cabeza del Buey", "CD Santa Amalia", "CP Montehermoso", "CD Gévora",
    "Jerez CF", "CD Azuaga", "AD Llerenense", "CF Villanovense", "CF Jaraíz",
    "CD Diocesano", "CD Badajoz", "CD Don Benito",
  ],
  [
    "CA Cirbonero", "CD Subiza", "CD Huarte", "CA Artajonés", "CD Izarra",
    "UDC Txantrea KKE", "CD Oberena", "CD Beti Onak", "CD Pamplona", "AD San Juan",
    "CD Ardoi", "CD Cortes", "CD Avance Ezkabarte", "Peña Sport FC", "CD Valle de Egüés",
    "FC Bidezarra", "Beti Kozkor KE", "CD Aoiz",
  ],
  [
    "CD Anguiano", "CD Agoncillo", "Yagüe CF", "Comillas CF", "CD Berceo",
    "CD Varea", "SD Oyonesa", "CA Vianés", "Club Haro Deportivo", "CD Autol",
    "CD San Marcial", "CD Calahorra", "CD Villegas", "FC La Calzada", "CD Pradejón",
    "CD Arnedo", "UD Logroñés B", "Peña Balsamaiso CF",
  ],
  [
    "ADCF Épila", "UD Casetas", "CD La Almunia", "CD Binéfar", "Atlético Monzón",
    "CD Zuera", "CD Utrillas", "SD Huesca B", "CD Cuarte", "CF Illueca",
    "CD Juventud Tamarite", "CD Caspe", "CD Cariñena", "CF Calamocha", "AD Almudévar",
    "CD Belchite 97", "Andorra CF", "CD Robres",
  ],
  [
    "CD Guadalajara B", "CD Pedroñeras", "CD Toledo", "CF Calvo Sotelo Puertollano", "Atlético Albacete",
    "CD Villacañas", "Villarrubia CF", "CD Sonseca", "CD Marchamalo", "CD Illescas",
    "CD Azuqueca", "AD San Clemente", "CF La Solana", "CD Tarancón", "CP Villarrobledo",
    "CD Huracán", "CD Cazalegas", "CD Manchego Ciudad Real",
  ],
];

const EXISTING_SLUG_ALIASES = new Map([
  ["racing-club-ferrol", "racing-de-ferrol"],
  ["ud-ibiza-eivissa", "ud-ibiza"],
  ["sd-amorebieta", "sd-amorebieta"],
]);

function printHelp() {
  console.log(`
Importa los clubes de Primera, Segunda y Tercera RFEF desde La Futbolteca.

Uso:
  node backend/scripts/importLaFutboltecaRFEF.js [opciones]

Opciones:
  --download          Descarga y convierte los escudos a WebP (default)
  --no-download       Solo actualiza metadatos
  --force-download    Reemplaza archivos locales existentes
  --db                Inserta o actualiza los clubes en PostgreSQL
  --db-only           Importa a PostgreSQL desde el manifiesto ya generado
  --dry-run           Valida las páginas sin escribir archivos ni base de datos
  --delay 900         Pausa mínima entre solicitudes, en ms (mínimo: 700)
  --limit 20          Limita el total de clubes, para pruebas
  --help              Muestra esta ayuda
`);
}

function parseArgs(argv) {
  const options = {
    download: true,
    forceDownload: false,
    db: false,
    dryRun: false,
    dbOnly: false,
    delay: 900,
    limit: null,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--download") options.download = true;
    else if (argument === "--no-download") options.download = false;
    else if (argument === "--force-download") options.forceDownload = true;
    else if (argument === "--db") options.db = true;
    else if (argument === "--dry-run") options.dryRun = true;
    else if (argument === "--db-only") options.dbOnly = true;
    else if (argument === "--delay") options.delay = Number(argv[++index]);
    else if (argument === "--limit") options.limit = Number(argv[++index]);
    else if (argument === "--help" || argument === "-h") options.help = true;
    else throw new Error(`Opción desconocida: ${argument}`);
  }

  if (!Number.isFinite(options.delay) || options.delay < 700) {
    throw new Error("--delay debe ser un número igual o mayor que 700 ms.");
  }
  if (options.limit !== null && (!Number.isInteger(options.limit) || options.limit < 1)) {
    throw new Error("--limit debe ser un entero positivo.");
  }
  return options;
}

function resolveDatabaseUrl(value, renderRegion = process.env.RENDER_POSTGRES_REGION) {
  if (!value) return value;
  const url = new URL(value);
  if (!url.hostname.includes(".") && renderRegion) {
    if (!/^[a-z0-9-]+$/i.test(renderRegion)) throw new Error("RENDER_POSTGRES_REGION no es válida.");
    url.hostname = `${url.hostname}.${renderRegion}-postgres.render.com`;
  }
  return url.href;
}

function decodeHtml(value) {
  const namedEntities = {
    amp: "&", apos: "'", gt: ">", lt: "<", nbsp: " ", quot: '"',
    aacute: "á", eacute: "é", iacute: "í", oacute: "ó", uacute: "ú",
    Aacute: "Á", Eacute: "É", Iacute: "Í", Oacute: "Ó", Uacute: "Ú",
    ntilde: "ñ", Ntilde: "Ñ", uuml: "ü", Uuml: "Ü",
  };
  return String(value || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, entity) => {
      if (entity[0] === "#") {
        const hexadecimal = entity[1].toLowerCase() === "x";
        const codePoint = Number.parseInt(entity.slice(hexadecimal ? 2 : 1), hexadecimal ? 16 : 10);
        return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : match;
      }
      return namedEntities[entity] ?? namedEntities[entity.toLowerCase()] ?? match;
    })
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " y ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 170);
}

function extractAttribute(tag, attribute) {
  const match = String(tag).match(new RegExp(`${attribute}=["']([^"']*)["']`, "i"));
  return match ? decodeHtml(match[1]) : "";
}

function absoluteSourceUrl(value) {
  const url = new URL(value, SOURCE_ORIGIN);
  if (url.hostname.endsWith("lafutbolteca.com")) url.protocol = "https:";
  return url.href;
}

function createClub({ name, tier, group, logoSourceUrl, sourcePageUrl, crop = null }) {
  const sourceSlug = slugify(name);
  return {
    source: SOURCE,
    source_slug: sourceSlug,
    name,
    country: COUNTRY,
    country_slug: COUNTRY_SLUG,
    league: `${tier} RFEF - Grupo ${group}`,
    logo_url: `/images/club-crests/espana/${SOURCE}-${sourceSlug}.webp`,
    logo_source_url: logoSourceUrl,
    source_page_url: sourcePageUrl,
    attribution: ATTRIBUTION,
    usage_context: "identification/editorial/reference",
    source_metadata: { season: SEASON, tier: `${tier} RFEF`, group, crop },
  };
}

function parseIndividualClubPage(html, { tier, group, pageUrl }) {
  const tags = String(html).match(/<img\b[^>]*>/gi) || [];
  const candidates = tags.filter((tag) => {
    const src = extractAttribute(tag, "src");
    const title = extractAttribute(tag, "title");
    const alt = extractAttribute(tag, "alt");
    return /\/wp-content\/uploads\//i.test(src) &&
      (/-150x150\.[a-z]+(?:\?|$)/i.test(src) || /size-thumbnail/i.test(tag)) &&
      (/^escudo\s+/i.test(alt) || Boolean(title));
  });

  const seen = new Set();
  const clubs = [];
  for (const tag of candidates) {
    const alt = extractAttribute(tag, "alt").replace(/^escudo\s+/i, "").trim();
    const title = extractAttribute(tag, "title").trim();
    const name = alt || title;
    const sourceSlug = slugify(name);
    if (!name || seen.has(sourceSlug)) continue;
    seen.add(sourceSlug);
    clubs.push(createClub({
      name,
      tier,
      group,
      logoSourceUrl: absoluteSourceUrl(extractAttribute(tag, "src")),
      sourcePageUrl: pageUrl,
    }));
  }
  return clubs;
}

function parseTerceraPage(html, group, pageUrl) {
  const tags = String(html).match(/<img\b[^>]*>/gi) || [];
  const plateTag = tags.find((tag) => {
    const src = extractAttribute(tag, "src");
    return /Tercera[^"']*RFEF/i.test(tag) && /2025-2026/i.test(src);
  });
  if (!plateTag) throw new Error(`No se encontró la lámina de Tercera RFEF grupo ${group}.`);

  const logoSourceUrl = absoluteSourceUrl(extractAttribute(plateTag, "src"));
  return TERCERA_GROUPS[group - 1].map((name, index) => createClub({
    name,
    tier: "Tercera",
    group,
    logoSourceUrl,
    sourcePageUrl: pageUrl,
    crop: { slot: GROUP_SLOTS[index], columns: 5, rows: 4 },
  }));
}

function parseRobotsTxt(robotsText) {
  const rules = [];
  let applies = false;
  for (const rawLine of String(robotsText).split(/\r?\n/)) {
    const line = rawLine.replace(/#.*$/, "").trim();
    if (!line) continue;
    const separator = line.indexOf(":");
    if (separator === -1) continue;
    const field = line.slice(0, separator).trim().toLowerCase();
    const value = line.slice(separator + 1).trim();
    if (field === "user-agent") applies = value === "*" || value.toLowerCase().includes("futbolproyect");
    else if (field === "disallow" && applies && value) rules.push(value);
  }
  return rules;
}

function assertRobotsAllows(disallowedPaths, targetUrl) {
  const pathname = new URL(targetUrl).pathname;
  const blocked = disallowedPaths.some((rule) => {
    const prefix = rule.replace(/\*.*$/, "").replace(/\$$/, "");
    return prefix && pathname.startsWith(prefix);
  });
  if (blocked) throw new Error(`robots.txt no permite consultar ${pathname}.`);
}

function requestResource(url, responseType = "text", redirects = 0) {
  return new Promise((resolve, reject) => {
    if (redirects > 5) return reject(new Error("demasiadas redirecciones"));
    const target = new URL(url);
    const client = target.protocol === "https:" ? https : http;
    const request = client.get(target, {
      headers: {
        Accept: responseType === "buffer" ? "image/avif,image/webp,image/*;q=0.9" : "text/html,text/plain;q=0.9",
        "User-Agent": "FutbolProyectClubImporter/1.0 (+https://futbolproyect.com)",
      },
      rejectUnauthorized: !target.hostname.endsWith("lafutbolteca.com"),
      timeout: 25_000,
    }, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        response.resume();
        return resolve(requestResource(new URL(response.headers.location, target).href, responseType, redirects + 1));
      }
      if (response.statusCode < 200 || response.statusCode >= 300) {
        response.resume();
        return reject(new Error(`HTTP ${response.statusCode}`));
      }
      const chunks = [];
      response.on("data", (chunk) => chunks.push(chunk));
      response.on("end", () => {
        const buffer = Buffer.concat(chunks);
        resolve(responseType === "buffer"
          ? { buffer, contentType: response.headers["content-type"] || "" }
          : buffer.toString("utf8"));
      });
    });
    request.on("timeout", () => request.destroy(new Error("tiempo de espera agotado")));
    request.on("error", reject);
  });
}

function createRateLimitedFetcher(delayMs) {
  let lastRequestAt = 0;
  return async (url, responseType = "text") => {
    let lastError;
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      const waitMs = Math.max(0, delayMs - (Date.now() - lastRequestAt));
      if (waitMs) await new Promise((resolve) => setTimeout(resolve, waitMs));
      lastRequestAt = Date.now();
      try {
        return await requestResource(url, responseType);
      } catch (error) {
        lastError = error;
        if (attempt < 3) await new Promise((resolve) => setTimeout(resolve, attempt * 800));
      }
    }
    throw new Error(`No se pudo descargar ${url}: ${lastError?.message || "error desconocido"}`);
  };
}

async function processIndividualCrest(club, imageBuffer) {
  return sharp(imageBuffer)
    .rotate()
    .trim({ background: "#ffffff", threshold: 12 })
    .resize(256, 256, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
      withoutEnlargement: false,
    })
    .webp({ quality: 90 })
    .toBuffer();
}

async function processPlateCrest(club, plateBuffer) {
  const metadata = await sharp(plateBuffer).metadata();
  if (!metadata.width || !metadata.height) throw new Error("lámina sin dimensiones válidas");
  const slot = club.source_metadata.crop.slot;
  const column = slot % 5;
  const row = Math.floor(slot / 5);
  const cellWidth = metadata.width / 5;
  const cellHeight = metadata.height / 4;
  const left = Math.round(column * cellWidth);
  const top = Math.round(row * cellHeight);
  const width = Math.min(Math.round(cellWidth * 0.73), metadata.width - left);
  const height = Math.min(Math.round(cellHeight * 0.78), metadata.height - top);

  // Sharp puede reordenar trim/extract en una misma tubería. Separamos las
  // etapas para que las coordenadas siempre se apliquen sobre la lámina original.
  const croppedBuffer = await sharp(plateBuffer)
    .extract({ left, top, width, height })
    .toBuffer();

  return sharp(croppedBuffer)
    .trim({ background: "#ffffff", threshold: 12 })
    .resize(256, 256, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
      withoutEnlargement: false,
    })
    .webp({ quality: 90 })
    .toBuffer();
}

async function downloadCrests(clubs, fetchResource, forceDownload) {
  await fs.mkdir(PUBLIC_ROOT, { recursive: true });
  const resourceCache = new Map();
  let available = 0;

  for (const [index, club] of clubs.entries()) {
    const filePath = path.join(PUBLIC_ROOT, `${SOURCE}-${club.source_slug}.webp`);
    if (!forceDownload) {
      try {
        await fs.access(filePath);
        available += 1;
        continue;
      } catch {
        // Continúa con la descarga.
      }
    }

    try {
      let resource = resourceCache.get(club.logo_source_url);
      if (!resource) {
        resource = await fetchResource(club.logo_source_url, "buffer");
        if (!String(resource.contentType).toLowerCase().startsWith("image/")) {
          throw new Error(`respuesta no válida: ${resource.contentType || "sin Content-Type"}`);
        }
        resourceCache.set(club.logo_source_url, resource);
      }
      const processed = club.source_metadata.crop
        ? await processPlateCrest(club, resource.buffer)
        : await processIndividualCrest(club, resource.buffer);
      await fs.writeFile(filePath, processed);
      available += 1;
    } catch (error) {
      club.logo_url = null;
      console.warn(`Aviso: no se pudo procesar ${club.name}: ${error.message}`);
    }

    if ((index + 1) % 50 === 0 || index + 1 === clubs.length) {
      console.log(`Escudos procesados: ${index + 1}/${clubs.length}.`);
    }
  }
  return available;
}

function csvEscape(value) {
  const text = value === null || value === undefined ? "" : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function clubsToCsv(clubs) {
  const columns = [
    "source", "source_slug", "name", "country", "country_slug", "league", "logo_url",
    "logo_source_url", "source_page_url", "attribution", "usage_context",
  ];
  return [
    columns.join(","),
    ...clubs.map((club) => columns.map((column) => csvEscape(club[column])).join(",")),
  ].join("\n");
}

async function readExistingManifest() {
  try {
    return JSON.parse(await fs.readFile(path.join(MANIFEST_ROOT, "clubs.json"), "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return { countries: [], clubs: [] };
    throw error;
  }
}

function mergeCatalog(existingManifest, importedClubs) {
  const previousSource = new Map(
    (existingManifest.clubs || [])
      .filter((club) => club.source === SOURCE)
      .map((club) => [club.source_slug, club]),
  );
  const existing = (existingManifest.clubs || []).filter((club) => club.source !== SOURCE);
  const existingSpainSlugs = new Set(
    existing
      .filter((club) => club.country_slug === COUNTRY_SLUG)
      .map((club) => club.source_slug),
  );
  const accepted = [];
  const reused = [];

  for (const club of importedClubs) {
    const equivalentSlug = EXISTING_SLUG_ALIASES.get(club.source_slug) || club.source_slug;
    if (existingSpainSlugs.has(equivalentSlug)) {
      reused.push({ club: club.name, existing_slug: equivalentSlug });
      continue;
    }
    const previous = previousSource.get(club.source_slug);
    if (!club.logo_url && previous?.logo_url) club.logo_url = previous.logo_url;
    accepted.push(club);
  }

  const clubs = [...existing, ...accepted].sort((left, right) =>
    left.country.localeCompare(right.country, "es") ||
    String(left.league || "").localeCompare(String(right.league || ""), "es") ||
    left.name.localeCompare(right.name, "es"));
  return { clubs, accepted, reused };
}

async function writeManifests(existingManifest, clubs) {
  await fs.mkdir(MANIFEST_ROOT, { recursive: true });
  const countries = [...new Set([
    ...(existingManifest.countries || []),
    ...clubs.map((club) => club.country_slug),
  ])].sort((left, right) => left.localeCompare(right));
  const sources = [...new Set([
    ...(existingManifest.sources || []),
    existingManifest.source,
    SOURCE_ORIGIN,
  ].filter(Boolean))];
  const manifest = {
    ...existingManifest,
    generated_at: new Date().toISOString(),
    sources,
    countries,
    count: clubs.length,
    clubs,
  };
  await Promise.all([
    fs.writeFile(path.join(MANIFEST_ROOT, "clubs.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8"),
    fs.writeFile(path.join(MANIFEST_ROOT, "clubs.csv"), `${clubsToCsv(clubs)}\n`, "utf8"),
  ]);
}

async function upsertClubs(clubs) {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL no está definida; no se puede usar --db.");
  const pool = new Pool({
    connectionString: resolveDatabaseUrl(process.env.DATABASE_URL),
    connectionTimeoutMillis: 15_000,
    ssl: { rejectUnauthorized: false },
  });
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(await fs.readFile(MIGRATION_PATH, "utf8"));
    for (const club of clubs) {
      await client.query(
        `INSERT INTO football_clubs (
          source, source_slug, name, country, country_slug, league,
          logo_url, logo_source_url, source_page_url, attribution,
          usage_context, source_metadata, is_active
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12::jsonb,TRUE)
        ON CONFLICT (source, source_slug) DO UPDATE SET
          name=EXCLUDED.name, country=EXCLUDED.country, country_slug=EXCLUDED.country_slug,
          league=EXCLUDED.league, logo_url=COALESCE(EXCLUDED.logo_url, football_clubs.logo_url),
          logo_source_url=EXCLUDED.logo_source_url, source_page_url=EXCLUDED.source_page_url,
          attribution=EXCLUDED.attribution, usage_context=EXCLUDED.usage_context,
          source_metadata=EXCLUDED.source_metadata, is_active=TRUE`,
        [
          club.source, club.source_slug, club.name, club.country, club.country_slug, club.league,
          club.logo_url, club.logo_source_url, club.source_page_url, club.attribution,
          club.usage_context, JSON.stringify({ ...club.source_metadata, imported_at: new Date().toISOString() }),
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
  if (options.dbOnly) {
    if (!options.db) throw new Error("--db-only requiere también --db.");
    const manifest = await readExistingManifest();
    const clubs = (manifest.clubs || []).filter((club) => club.source === SOURCE);
    if (!clubs.length) throw new Error("El manifiesto no contiene clubes de La Futbolteca.");
    await upsertClubs(clubs);
    console.log(`${clubs.length} clubes de La Futbolteca insertados o actualizados en PostgreSQL.`);
    return { clubs, accepted: clubs, reused: [] };
  }

  const fetchResource = createRateLimitedFetcher(options.delay);
  const robotsText = await fetchResource(`${SOURCE_ORIGIN}/robots.txt`);
  const disallowedPaths = parseRobotsTxt(robotsText);
  let clubs = [];

  for (const tier of ["Primera", "Segunda"]) {
    const groups = tier === "Primera" ? 2 : 5;
    for (let group = 1; group <= groups; group += 1) {
      const slug = tier === "Primera" ? "primera-rfef" : "segunda-rfef";
      const pageUrl = `${SOURCE_ORIGIN}/${slug}-${group}/`;
      assertRobotsAllows(disallowedPaths, pageUrl);
      const html = await fetchResource(pageUrl);
      const parsed = parseIndividualClubPage(html, { tier, group, pageUrl });
      clubs.push(...parsed);
      console.log(`${tier} RFEF grupo ${group}: ${parsed.length} clubes.`);
    }
  }

  for (let group = 1; group <= 18; group += 1) {
    const pageUrl = `${SOURCE_ORIGIN}/tercera/3divg${group}/`;
    assertRobotsAllows(disallowedPaths, pageUrl);
    const html = await fetchResource(pageUrl);
    const parsed = parseTerceraPage(html, group, pageUrl);
    clubs.push(...parsed);
    console.log(`Tercera RFEF grupo ${group}: ${parsed.length} clubes.`);
  }

  const unique = new Map(clubs.map((club) => [`${club.source}:${club.source_slug}`, club]));
  clubs = [...unique.values()];
  if (options.limit !== null) clubs = clubs.slice(0, options.limit);

  const expected = options.limit === null ? 454 : Math.min(options.limit, 454);
  if (clubs.length !== expected) {
    throw new Error(`Se esperaban ${expected} clubes y se obtuvieron ${clubs.length}.`);
  }

  if (options.dryRun) {
    console.log(`Dry run correcto: ${clubs.length} clubes validados; no se escribió ningún archivo.`);
    return { clubs, accepted: clubs, reused: [] };
  }

  if (options.download) {
    const available = await downloadCrests(clubs, fetchResource, options.forceDownload);
    console.log(`${available}/${clubs.length} escudos disponibles localmente.`);
  }

  const existingManifest = await readExistingManifest();
  const merged = mergeCatalog(existingManifest, clubs);
  await writeManifests(existingManifest, merged.clubs);
  console.log(`${merged.accepted.length} clubes nuevos de La Futbolteca; ${merged.reused.length} reutilizados del catálogo existente.`);
  console.log(`Catálogo combinado: ${merged.clubs.length} clubes.`);

  if (options.db) {
    await upsertClubs(merged.accepted);
    console.log(`${merged.accepted.length} clubes insertados o actualizados en PostgreSQL.`);
  }
  return merged;
}

async function main() {
  try {
    const options = parseArgs(process.argv.slice(2));
    if (options.help) return printHelp();
    await run(options);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exitCode = 1;
  }
}

if (require.main === module) main();

module.exports = {
  GROUP_SLOTS,
  TERCERA_GROUPS,
  clubsToCsv,
  decodeHtml,
  mergeCatalog,
  parseArgs,
  parseIndividualClubPage,
  parseRobotsTxt,
  parseTerceraPage,
  resolveDatabaseUrl,
  slugify,
};
