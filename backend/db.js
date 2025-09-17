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
    let pgValues = [];
    let paramIndex = 1;

    // Reemplazar @param con $1, $2, etc., y recolectar los valores
    for (const key in params) {
      if (params.hasOwnProperty(key)) {
        // Usar una regex para reemplazar todas las ocurrencias de @key como palabra completa
        pgText = pgText.replace(new RegExp(`@${key}\b`, 'g'), '
        paramIndex++;
      }
    }

    return pool.query(pgText, pgValues);
  },
};
 + paramIndex);
        pgValues.push(params[key]);
        paramIndex++;
      }
    }

    return pool.query(pgText, pgValues);
  },
};
