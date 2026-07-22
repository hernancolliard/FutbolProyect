# Base de datos de clubes y escudos

El importador crea un catálogo independiente en `football_clubs` con nombre, país, liga, URL pública local del escudo, URL original y atribución. La fuente elegida es FootyLogos porque publica páginas navegables por país y archivos WebP; Transfermarkt actualmente presenta verificación anti-robot.

## Uso rápido

Desde la raíz del proyecto:

```powershell
# Validar el scraper con cinco clubes, sin escribir nada
node backend/scripts/importClubCrests.js --dry-run --limit 5

# Argentina: descargar escudos, generar CSV/JSON e importar a PostgreSQL
node backend/scripts/importClubCrests.js --countries argentina --db

# Varios países (los valores son los slugs usados por FootyLogos)
node backend/scripts/importClubCrests.js --countries argentina,uruguay,brazil,chile --db
```

Para `--db`, definí `DATABASE_URL` en `backend/.env` o en el entorno. El script ejecuta primero `create_football_clubs.sql`, por lo que puede crear la tabla automáticamente. Los registros se actualizan con `upsert`: repetir una importación no genera duplicados.

Si solo querés referencias remotas y no querés descargar imágenes:

```powershell
node backend/scripts/importClubCrests.js --countries argentina --no-download --db
```

Si Windows muestra `unable to verify the first certificate` (habitual en redes con proxy corporativo), conservá la validación TLS y usá el almacén de certificados del sistema:

```powershell
node --use-system-ca backend/scripts/importClubCrests.js --countries argentina --db
```

No uses `NODE_TLS_REJECT_UNAUTHORIZED=0`.

## Archivos generados

- `data/club-crests/clubs.json`: manifiesto completo.
- `data/club-crests/clubs.csv`: versión para Excel, DBeaver u otros sistemas.
- `futbolproyect-nextjs/public/images/club-crests/<pais>/<club>.webp`: imágenes servidas por Next.js.

La URL que se guarda en `football_clubs.logo_url` es local, por ejemplo `/images/club-crests/argentina/boca-juniors.webp`. Esto evita depender de hotlinking en producción.

Las ejecuciones siguientes reutilizan los archivos locales existentes. Usá `--force-download` cuando quieras volver a descargar y reemplazar todos los escudos.

## Consulta de ejemplo

```sql
SELECT id, name, country, league, logo_url
FROM football_clubs
WHERE is_active = TRUE
  AND LOWER(country) = LOWER('Argentina')
ORDER BY name;
```

## Uso responsable

- El importador consulta `robots.txt` antes de comenzar y se detiene si la ruta está bloqueada.
- La pausa mínima es de 500 ms y el valor predeterminado es 900 ms. No la elimines ni ejecutes muchas copias en paralelo.
- FootyLogos pide citar su sitio como fuente. Conservá `attribution` y agregá un crédito visible en FutbolProyect.
- Los escudos son marcas de sus respectivos clubes. FootyLogos los ofrece para identificación y uso editorial/de referencia; este código no concede una licencia comercial. Para publicidad, merchandising, una apariencia de afiliación oficial o cualquier uso distinto, pedí autorización al titular de la marca.
- FootyLogos también vende packs organizados. Si necesitás una liga completa o archivos de alta resolución, comprar el pack es una alternativa más estable que una importación masiva.

## Mantenimiento

Ejecutá el importador de forma manual o con una tarea programada de baja frecuencia (por ejemplo, mensual). Revisá el CSV antes de publicar cambios grandes, porque los nombres, ligas y escudos pueden cambiar durante una temporada.
