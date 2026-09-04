import { getPlayerPositionCategory } from "@/lib/profilePositions";
import { slugify } from "@/lib/seoSlugs";

export const SEO_POSITIONS = [
  { slug: "arqueros", value: "Arquero", label: "Arqueros" },
  { slug: "defensas", value: "Defensa", label: "Defensas" },
  {
    slug: "centrocampistas",
    value: "Centrocampista",
    label: "Centrocampistas",
  },
  { slug: "delanteros", value: "Delantero", label: "Delanteros" },
] as const;

const POSITION_ALIASES: Record<string, string> = {
  arquero: "arqueros",
  portero: "arqueros",
  porteros: "arqueros",
  defensa: "defensas",
  centrocampista: "centrocampistas",
  mediocampista: "centrocampistas",
  mediocampistas: "centrocampistas",
  delantero: "delanteros",
};

export const getSeoPosition = (slug: string) => {
  const normalized = POSITION_ALIASES[slugify(slug)] || slugify(slug);
  return SEO_POSITIONS.find((position) => position.slug === normalized) || null;
};

export const getPositionSlug = (position?: string | null) => {
  const category = getPlayerPositionCategory(position);
  return SEO_POSITIONS.find((item) => item.value === category)?.slug || "";
};

export const getCountrySlug = (country?: string | null) => slugify(country || "");

export const getPlayersCategoryPath = (position: string, country: string) => {
  const positionSlug = getPositionSlug(position);
  const countrySlug = getCountrySlug(country);
  return positionSlug && countrySlug
    ? `/jugadores/${positionSlug}/${countrySlug}`
    : "";
};
