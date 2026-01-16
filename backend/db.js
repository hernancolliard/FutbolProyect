const { Pool } = require("pg");

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
        error: error.message,
      });
      // Re-lanzar el error para que el manejador de la ruta lo capture
      throw error;
    }
  },
  getClient: async () => {
    const client = await pool.connect();
    const originalQuery = client.query;
    const originalRelease = client.release;

    // Monkey-patch a new query method that handles named parameters
    client.query = async (text, params) => {
      if (!params) {
        return originalQuery.call(client, text);
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
      return originalQuery.call(client, newText, pgValues);
    };

    return client;
  },
};
