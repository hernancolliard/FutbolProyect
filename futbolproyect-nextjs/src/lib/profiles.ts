import { Profile } from "@/lib/types";

/**
 * Obtiene la URL base correcta según entorno
 */
const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }

  const port = process.env.PORT || 5000;
  return `http://localhost:${port}`;
};
export async function getAllProfiles() {
  const apiUrl = getBaseUrl();
  const res = await fetch(`${apiUrl}/api/profiles`, { cache: "no-store" });
  return res.json();
}

/**
 * ===============================
 * PERFIL POR ID (slug === id)
 * ===============================
 */
export async function getProfileById(id: string): Promise<Profile | null> {
  const apiUrl = getBaseUrl();

  try {
    const res = await fetch(`${apiUrl}/profiles/${id}`, {
      cache: "no-store", // perfil individual siempre actualizado
    });

    if (!res.ok) {
      console.error("Error fetching profile:", res.status);
      return null;
    }

    const profile: Profile = await res.json();
    return profile;
  } catch (error) {
    console.error("Network error fetching profile:", error);
    return null;
  }
}
