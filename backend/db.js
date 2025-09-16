const sql = require("mssql");


const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  port: parseInt(process.env.DB_PORT, 10),
  options: {
    encrypt: process.env.DB_ENCRYPT === "true", // Para Azure SQL
    trustServerCertificate: true, // Cambiar a false para producción con certificados válidos
  },
};

// La conexión se gestiona de forma asíncrona usando un "pool" para eficiencia.
const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then((pool) => {
    console.log("Conectado a SQL Server");
    return pool;
  })
  .catch((err) => console.error("Error de conexión a la base de datos: ", err));

module.exports = {
  // Exportamos una función para ejecutar queries que usa el pool
  query: async (text, params) => {
    const pool = await poolPromise;
    const request = pool.request();
    if (params) {
      for (const key in params) {
        request.input(key, params[key]);
      }
    }
    return await request.query(text);
  },
};
