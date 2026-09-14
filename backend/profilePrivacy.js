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

const getProfileAge = (birthDate, today = new Date()) => {
  if (!birthDate) return null;

  const dateOnlyMatch = String(birthDate)
    .trim()
    .match(/^(\d{4})-(\d{2})-(\d{2})/);
  const parsedBirthDate = dateOnlyMatch
    ? new Date(
        Number(dateOnlyMatch[1]),
        Number(dateOnlyMatch[2]) - 1,
        Number(dateOnlyMatch[3]),
      )
    : new Date(birthDate);
  if (Number.isNaN(parsedBirthDate.getTime())) return null;

  let age = today.getFullYear() - parsedBirthDate.getFullYear();
  const monthDifference = today.getMonth() - parsedBirthDate.getMonth();
  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < parsedBirthDate.getDate())
  ) {
    age -= 1;
  }

  return age >= 0 ? age : null;
};

const protectProfileBirthDate = (
  profile,
  { canViewExactBirthDate = false } = {},
) => {
  if (!profile) return profile;

  const age = getProfileAge(profile.fecha_de_nacimiento);
  return {
    ...profile,
    fecha_de_nacimiento: canViewExactBirthDate
      ? profile.fecha_de_nacimiento
      : null,
    edad: age,
    es_menor: age !== null && age < 18,
  };
};

const getProfileForRequester = (
  profile,
  requester,
  { canViewExactBirthDate = false } = {},
) => {
  const profileWithProtectedContact = requester
    ? profile
    : redactProfileContact(profile);

  return protectProfileBirthDate(profileWithProtectedContact, {
    canViewExactBirthDate,
  });
};

module.exports = {
  PRIVATE_PROFILE_CONTACT_FIELDS,
  getProfileAge,
  getProfileForRequester,
  protectProfileBirthDate,
  redactProfileContact,
};
