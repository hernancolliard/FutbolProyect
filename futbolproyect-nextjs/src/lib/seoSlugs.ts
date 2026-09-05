import { Profile } from "@/lib/types";

export const slugify = (value: string) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

export const getOfferPath = (offer: { id: string | number; titulo?: string }) => {
  const slug = slugify(offer.titulo || "oferta-de-futbol");
  return `/offers/${slug || "oferta-de-futbol"}--${encodeURIComponent(String(offer.id))}`;
};

export const getProfilePath = (
  profile: Pick<Profile, "id" | "nombre" | "apellido" | "posicion_principal">,
) => {
  const slug = slugify(
    `${profile.nombre || ""} ${profile.apellido || ""} ${profile.posicion_principal || ""}`,
  );
  return `/perfiles/${slug || "perfil-de-futbol"}--${encodeURIComponent(String(profile.id))}`;
};

export const parseSeoId = (value: string) => {
  const separatorIndex = value.lastIndexOf("--");
  const encodedId =
    separatorIndex >= 0 ? value.slice(separatorIndex + 2) : value;

  try {
    return decodeURIComponent(encodedId);
  } catch {
    return encodedId;
  }
};

export const hasProfilePhoto = (profile: Pick<Profile, "foto_perfil_url">) =>
  Boolean(profile.foto_perfil_url) &&
  !String(profile.foto_perfil_url).includes("/images/logos/");

export const getProfileCompletion = (profile: Profile) => {
  const fields = [
    hasProfilePhoto(profile),
    profile.telefono,
    profile.nacionalidad,
    profile.resumen_profesional,
    profile.cv_url,
    profile.posicion_principal,
    profile.altura_cm,
    profile.peso_kg,
    profile.pie_dominante,
    profile.fecha_de_nacimiento,
    profile.idiomas,
    profile.estadisticas,
    profile.trayectoria,
    profile.disponibilidad,
  ];
  const completed = fields.filter(Boolean).length;
  return Math.round((completed / fields.length) * 100);
};

export const isProfileIndexable = (profile: Profile) => {
  if (typeof profile.is_indexable === "boolean") return profile.is_indexable;
  if (profile.completion_score !== undefined) {
    return Number(profile.completion_score) >= 5;
  }
  return getProfileCompletion(profile) >= 50;
};
