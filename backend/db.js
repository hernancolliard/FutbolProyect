const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.connect()
  .then(() => console.log('Conectado a PostgreSQL'))
  .catch(err => console.error('Error de conexión a la base de datos: ', err));

module.exports = {
  query: async (text, params) => {
    if (!params) {
      return pool.query(text);
    }

    let paramNames = Object.keys(params);
    let paramValues = Object.values(params);
    let pgText = text;

    // Replace @param with $1, $2, etc.
    paramNames.forEach((name, index) => {
      pgText = pgText.replace(new RegExp(`@${name}`, 'g'), `\${index + 1}`);
    });

    return pool.query(pgText, paramValues);
  },
};
