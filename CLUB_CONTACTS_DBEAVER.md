Instrucciones para DBeaver

1) Abrir DBeaver y conectar a la base de datos PostgreSQL usada por la aplicación.
2) Abrir una nueva SQL Editor y cargar el archivo `create_club_contacts.sql` ubicado en la raíz del proyecto.
3) Ejecutar todo el script (botón Run) para crear la tabla, índices y trigger.

Notas:
- El script está diseñado para PostgreSQL.
- Si tu esquema necesita un prefijo, ajusta el nombre `club_contacts` por `schema.club_contacts`.
- Incluí una fila de ejemplo al final del script.

Comandos rápidos (psql):

```bash
psql "$DATABASE_URL" -f create_club_contacts.sql
```

*** Fin ***
