export type ClubLogoSource = "" | "catalog" | "custom";

export interface CareerClubValue {
  club_id: number | null;
  club: string;
  league: string;
  country: string;
  logo_url: string;
  logo_source: ClubLogoSource;
}

export interface ClubOption {
  id: number;
  name: string;
  country: string;
  country_slug: string;
  league: string | null;
  logo_url: string | null;
}

export const normalizeClubLogoSource = (value: unknown): ClubLogoSource =>
  value === "catalog" || value === "custom" ? value : "";

export const getSafeClubLogoUrl = (value?: string | null) => {
  const source = String(value || "").trim();
  if (/^\/images\/club-crests\/[a-z0-9-]+\/[a-z0-9-]+\.webp$/i.test(source)) {
    return source;
  }

  try {
    const url = new URL(source);
    const isAllowedS3Host =
      /^futbolproyect-imagenes\.s3(?:\.[a-z0-9-]+)?\.amazonaws\.com$/i.test(
        url.hostname,
      );
    return url.protocol === "https:" && isAllowedS3Host ? url.href : "";
  } catch {
    return "";
  }
};
