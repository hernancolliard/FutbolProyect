const PRIVATE_PROFILE_CONTACT_FIELDS = [
  "email",
  "telefono",
  "whatsapp_url",
  "agente_contacto",
];

const redactProfileContact = (profile) => {
  if (!profile) return profile;

  const sanitizedProfile = { ...profile };
  PRIVATE_PROFILE_CONTACT_FIELDS.forEach((field) => {
    sanitizedProfile[field] = null;
  });
  return sanitizedProfile;
};

const getProfileForRequester = (profile, requester) =>
  requester ? profile : redactProfileContact(profile);

module.exports = {
  PRIVATE_PROFILE_CONTACT_FIELDS,
  getProfileForRequester,
  redactProfileContact,
};
