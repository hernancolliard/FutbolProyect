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

    const pgValues = [];
    const namedParams = {};

    // Reemplazar los parámetros con nombre por marcadores de posición posicionales
    const newText = text.replace(/@(\w+)/g, (match, key) => {
      // Verificar si la clave existe en los parámetros proporcionados
      if (!params.hasOwnProperty(key)) {
        throw new Error(`Missing parameter value for key: ${key}`);
      }
      // Si la clave es nueva, añadir su valor al array y crear un nuevo marcador de posición
      if (!namedParams.hasOwnProperty(key)) {
        pgValues.push(params[key]);
        namedParams[key] = `$${pgValues.length}`;
      }
      return namedParams[key];
    });

    return pool.query(newText, pgValues);
  },
};
