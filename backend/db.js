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

    let pgText = text;
    const pgValues = [];
    
    // Find all @param instances in the text to define the order
    const foundParams = text.match(/@\w+/g) || [];
    const uniqueParams = [...new Set(foundParams)];

    uniqueParams.forEach((param, i) => {
      const key = param.substring(1);
      if (params.hasOwnProperty(key)) {
        pgText = pgText.replace(new RegExp(param, 'g'), `$${i + 1}`);
        pgValues.push(params[key]);
      }
    });

    return pool.query(pgText, pgValues);
  },
};