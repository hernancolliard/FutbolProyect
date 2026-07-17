const ACTIVE_OFFER_NOTIFICATION_RECIPIENTS_QUERY = `
  SELECT u.email
  FROM usuarios u
  WHERE u.tipo_usuario = 'postulante'
    AND NULLIF(TRIM(u.email), '') IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM suscripciones s
      WHERE s.id_usuario = u.id
        AND s.estado = 'activa'
        AND s.fecha_fin > NOW()
    )
`;

const getActiveOfferNotificationRecipients = async (client) => {
  const result = await client.query(
    ACTIVE_OFFER_NOTIFICATION_RECIPIENTS_QUERY,
  );

  return result.rows;
};

module.exports = {
  ACTIVE_OFFER_NOTIFICATION_RECIPIENTS_QUERY,
  getActiveOfferNotificationRecipients,
};
