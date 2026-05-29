export const PLAYER_POSITION_OPTIONS = [
  {
    value: "Arquero",
    labelKey: "profile_position_goalkeeper",
    fallback: "Arquero",
  },
  {
    value: "Defensa",
    labelKey: "profile_position_defender",
    fallback: "Defensa",
  },
  {
    value: "Centrocampista",
    labelKey: "profile_position_midfielder",
    fallback: "Centrocampista",
  },
  {
    value: "Delantero",
    labelKey: "profile_position_forward",
    fallback: "Delantero",
  },
] as const;

export const PLAYER_POSITION_VALUES = PLAYER_POSITION_OPTIONS.map(
  (option) => option.value,
);

const normalizePositionText = (value?: string | null) =>
  (value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

export const getPlayerPositionCategory = (value?: string | null) => {
  const normalized = normalizePositionText(value);

  if (!normalized) return "";

  if (
    normalized.includes("arquero") ||
    normalized.includes("portero") ||
    normalized.includes("goalkeeper")
  ) {
    return "Arquero";
  }

  if (
    normalized.includes("defensa") ||
    normalized.includes("defensor") ||
    normalized.includes("lateral") ||
    normalized.includes("central")
  ) {
    return "Defensa";
  }

  if (
    normalized.includes("centrocampista") ||
    normalized.includes("mediocampista") ||
    normalized.includes("medio") ||
    normalized.includes("volante") ||
    normalized.includes("pivote") ||
    normalized.includes("enganche")
  ) {
    return "Centrocampista";
  }

  if (
    normalized.includes("delantero") ||
    normalized.includes("atacante") ||
    normalized.includes("extremo") ||
    normalized.includes("punta") ||
    normalized.includes("wing")
  ) {
    return "Delantero";
  }

  return PLAYER_POSITION_VALUES.includes(value as any) ? value || "" : "";
};
