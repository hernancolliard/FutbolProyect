// Discovery data can include published contacts. Use the existing pool's client
// interface, which does not log SQL parameters on errors.
const base = require('../db');
module.exports = {
  getClient: () => base.getClient(),
  query: async (text,params) => {
    const client = await base.getClient();
    try { return await client.query(text,params); } finally { client.release(); }
  },
};
