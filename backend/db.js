const { Pool } = require("pg");

console.log("DATABASE_URL:", process.env.DATABASE_URL);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool
  .connect()
  .then(() => console.log("Conectado a PostgreSQL"))
  .catch((err) => console.error("Error de conexión a la base de datos: ", err));

module.exports = {
  query: async (text, params) => {
    try {
      // Lógica para convertir parámetros con nombre a posicionales
      if (!params) {
        return await pool.query(text);
      }

      const pgValues = [];
      const namedParams = {};

      const newText = text.replace(/@(\w+)/g, (match, key) => {
        if (!params.hasOwnProperty(key)) {
          throw new Error(`Missing parameter value for key: ${key}`);
        }
        if (!namedParams.hasOwnProperty(key)) {
          pgValues.push(params[key]);
          namedParams[key] = `$${pgValues.length}`;
        }
        return namedParams[key];
      });

      return await pool.query(newText, pgValues);

    } catch (error) {
      // Loguear el error con más contexto antes de que se propague
      console.error("Error ejecutando la consulta:", { 
        query: text, 
        params: params, 
        error: error.message 
      });
      // Re-lanzar el error para que el manejador de la ruta lo capture
      throw error;
    }
  },
};