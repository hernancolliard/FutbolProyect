import { getAllProfiles } from "@/lib/profiles";

export default async function sitemap() {
  const profiles = await getAllProfiles();

  return profiles.map((p: any) => ({
    url: `https://futbolproyect.com/perfiles/${p.id}`,
    lastModified: new Date().toISOString(),
  }));
}
