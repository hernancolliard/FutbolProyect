const { offerSchema } = require('../offerSchema');
const { translateText } = require('./translationService');

// Shared by POST /offers and the review transaction; callers enforce permissions.
async function createOfferRecord(client, body, userId) {
 const data = offerSchema.parse(body);
 const fields = ['titulo','descripcion','puesto','ubicacion','horarios','nivel','detalles_adicionales'];
 const translations = await Promise.all(fields.map(field => translateText(data[field])));
 const params = { id_usuario_ofertante: userId, salario: data.salario ?? null,
  imagen_url: body.processedImages?.imagen_url?.original || null };
 fields.forEach((field,index) => {
  params[field] = data[field] || null;
  params[`${field}_es`] = translations[index].es;
  params[`${field}_en`] = translations[index].en;
 });
 const columns = Object.keys(params);
 const result = await client.query(
  `INSERT INTO ofertas_laborales (${columns.join(', ')}, estado)
   VALUES (${columns.map(field => `@${field}`).join(', ')}, 'abierta') RETURNING id`, params);
 return result.rows[0].id;
}
module.exports = { createOfferRecord };

async function updateOfferRecord(client, id, body, userId, isAdmin) {
  offerSchema.parse(body);
  const { titulo, descripcion, puesto, ubicacion, salario, horarios, nivel, detalles_adicionales, processedImages } = body;
  const id_usuario_actual = userId, esAdmin = isAdmin;
  // 1. Verificar que la oferta existe y obtener el dueño
  const offerQuery = `SELECT id_usuario_ofertante FROM ofertas_laborales WHERE id = @id`;
  const offerResult = await client.query(offerQuery, { id });

  if (offerResult.rows.length === 0) {
    throw Object.assign(new Error("Oferta no encontrada."), {status:404});
  }

  const id_dueño_oferta = offerResult.rows[0].id_usuario_ofertante;

  // 2. Verificar permisos (solo el dueño o un admin pueden editar)
  if (id_dueño_oferta !== id_usuario_actual && !esAdmin) {
    throw Object.assign(new Error("No tienes permiso para editar esta oferta."), {status:403});
  }

  // 3. Construir la consulta de actualización dinámica
  let updateFields = [];
  let queryParams = { id };

  if (titulo) {
    const titulo_trans = await translateText(titulo);
    updateFields.push("titulo = @titulo");
    updateFields.push("titulo_es = @titulo_es");
    updateFields.push("titulo_en = @titulo_en");
    queryParams.titulo = titulo;
    queryParams.titulo_es = titulo_trans.es;
    queryParams.titulo_en = titulo_trans.en;
  }
  if (descripcion) {
    const desc_trans = await translateText(descripcion);
    updateFields.push("descripcion = @descripcion");
    updateFields.push("descripcion_es = @descripcion_es");
    updateFields.push("descripcion_en = @descripcion_en");
    queryParams.descripcion = descripcion;
    queryParams.descripcion_es = desc_trans.es;
    queryParams.descripcion_en = desc_trans.en;
  }
  if (puesto) {
    const puesto_trans = await translateText(puesto);
    updateFields.push("puesto = @puesto");
    updateFields.push("puesto_es = @puesto_es");
    updateFields.push("puesto_en = @puesto_en");
    queryParams.puesto = puesto;
    queryParams.puesto_es = puesto_trans.es;
    queryParams.puesto_en = puesto_trans.en;
  }
  if (ubicacion) {
    const ubicacion_trans = await translateText(ubicacion);
    updateFields.push("ubicacion = @ubicacion");
    updateFields.push("ubicacion_es = @ubicacion_es");
    updateFields.push("ubicacion_en = @ubicacion_en");
    queryParams.ubicacion = ubicacion;
    queryParams.ubicacion_es = ubicacion_trans.es;
    queryParams.ubicacion_en = ubicacion_trans.en;
  }
  if (salario) {
    updateFields.push("salario = @salario");
    queryParams.salario = salario;
  }
  if (horarios) {
    const horarios_trans = await translateText(horarios);
    updateFields.push("horarios = @horarios");
    updateFields.push("horarios_es = @horarios_es");
    updateFields.push("horarios_en = @horarios_en");
    queryParams.horarios = horarios;
    queryParams.horarios_es = horarios_trans.es;
    queryParams.horarios_en = horarios_trans.en;
  }
  if (nivel) {
    const nivel_trans = await translateText(nivel);
    updateFields.push("nivel = @nivel");
    updateFields.push("nivel_es = @nivel_es");
    updateFields.push("nivel_en = @nivel_en");
    queryParams.nivel = nivel;
    queryParams.nivel_es = nivel_trans.es;
    queryParams.nivel_en = nivel_trans.en;
  }
  if (detalles_adicionales) {
    const detalles_trans = await translateText(detalles_adicionales);
    updateFields.push("detalles_adicionales = @detalles_adicionales");
    updateFields.push("detalles_adicionales_es = @detalles_adicionales_es");
    updateFields.push("detalles_adicionales_en = @detalles_adicionales_en");
    queryParams.detalles_adicionales = detalles_adicionales;
    queryParams.detalles_adicionales_es = detalles_trans.es;
    queryParams.detalles_adicionales_en = detalles_trans.en;
  }
  if (processedImages && processedImages.imagen_url) {
    updateFields.push("imagen_url = @imagen_url");
    queryParams.imagen_url = processedImages.imagen_url.original;
  }

  if (updateFields.length === 0) {
    throw Object.assign(new Error("No se proporcionaron campos para actualizar."), {status:400});
  }

  const updateQuery = `
    UPDATE ofertas_laborales
    SET ${updateFields.join(", ")}
    WHERE id = @id;
  `;

  await client.query(updateQuery, queryParams);

}
module.exports.updateOfferRecord = updateOfferRecord;
