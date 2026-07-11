const { Pool } = require("pg");
const { convertNamedQuery } = require("./queryParams");

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL no está definida. Verifica tus variables de entorno.",
  );
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  allowExitOnIdle: true,
  connectionTimeoutMillis: 5000, // Timeout de 5s para evitar que el build se cuelgue
});

module.exports = {
  query: async (text, params) => {
    try {
      const converted = convertNamedQuery(text, params);
      return converted.values === undefined
        ? await pool.query(converted.text)
        : await pool.query(converted.text, converted.values);
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

    // No modificar client.query: los clientes del pool se reutilizan y cada
    // modificacion se acumulaba hasta perder los valores de $1, $2, etc.
    return {
      query: async (text, params) => {
        const converted = convertNamedQuery(text, params);
        return converted.values === undefined
          ? await client.query(converted.text)
          : await client.query(converted.text, converted.values);
      },
      release: () => client.release(),
    };
  },
};
