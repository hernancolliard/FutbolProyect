const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool
  .connect()
  .then(() => console.log("Conectado a PostgreSQL"))
  .catch((err) => console.error("Error de conexión a la base de datos: ", err));

module.exports = {
  query: async (text, params) => {
    // Si no hay parámetros con nombre, ejecutar la consulta directamente
    if (!params) {
      return pool.query(text);
    }

    let pgText = text;
    const pgValues = [];
    let paramIndex = 1;

    // Crear un array de pares clave-valor para mantener el orden
    const paramKeys = Object.keys(params);

    // Iterar sobre los parámetros y construir la consulta para PostgreSQL
    paramKeys.forEach((key) => {
      // Reemplazar todas las instancias del parámetro con nombre (@key)
      // por el marcador de posición posicional ($1, $2, etc.)
      const namedParam = `@${key}`;
      const placeholder = `$${paramIndex}`;
      pgText = pgText.replace(new RegExp(namedParam, "g"), placeholder);
      pgValues.push(params[key]);
      paramIndex++;
    });

    return pool.query(pgText, pgValues);
  },
};
