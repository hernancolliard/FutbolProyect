require('dotenv').config();
const { runDiscovery } = require('../services/offerDiscoveryService');
if(process.env.DISCOVERY_SCHEDULE_ENABLED !== 'true') {
  console.log('Busqueda programada desactivada: DISCOVERY_SCHEDULE_ENABLED no es true.');
} else {
  runDiscovery(require('../services/offerDiscoveryDb'),null,{scheduled:true}).then(result => {
    console.log(JSON.stringify(result)); if(result.status === 'failed') process.exitCode=1;
  }).catch(error => {
    console.error(error.status === 409 ? 'Busqueda omitida: otra ejecucion activa.' : 'Busqueda fallida. Revisar configuracion e historial del administrador.');
    process.exitCode=error.status === 409 ? 0 : 1;
  });
}
