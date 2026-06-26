"use client";

import React, { useEffect, useMemo, useState, useTransition } from "react";
import { Profile } from "@/lib/types";
import { useTranslation } from "react-i18next";
import apiClient from "@/lib/apiClient";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { HeroPlayer } from "./HeroPlayer";
import { PlayerTabs } from "./PlayerTabs";
import { PlayerStats } from "./PlayerStats";
import { PlayerGallery } from "./PlayerGallery";
import { PlayerTimeline } from "./PlayerTimeline";
import { PlayerContact } from "./PlayerContact";
import { PlayerScouting } from "./PlayerScouting";
import { PlayerSidebar } from "./PlayerSidebar";
import { PlayerShare } from "./PlayerShare";
import { PlayerDocuments } from "./PlayerDocuments";
import EditProfileModal from "./EditProfileModal";
import VideosSection from "./VideosSection";
import UserPhotosSection from "./UserPhotosSection";
import ScoutingReportsSection from "./ScoutingReportsSection";
import MyApplicationsSection from "./MyApplicationsSection";
import MyOffersSection from "./MyOffersSection";
import ManagedPlayerProfilesSection from "./ManagedPlayerProfilesSection";
import AdBanner from "@/components/ads/AdBanner";
import { ArrowRight, BadgeCheck, BadgeInfo, CalendarRange, Compass, FileText, ImageIcon, MessageCircle, PlayCircle, Sparkles, Star, TrendingUp, Users } from "lucide-react";

interface ProfilePageClientProps {
  profile: Profile | null;
  requestedProfileId?: string;
}

const ANONYMOUS_VOTER_ID_KEY = "fp_anonymous_voter_id";

const getOrCreateAnonymousVoterId = () => {
  if (typeof window === "undefined") return null;

  try {
    const existing = window.localStorage.getItem(ANONYMOUS_VOTER_ID_KEY);
    if (existing) return existing;

    const newId =
      typeof window.crypto?.randomUUID === "function"
        ? window.crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    window.localStorage.setItem(ANONYMOUS_VOTER_ID_KEY, newId);
    return newId;
  } catch {
    return null;
  }
};

export default function ProfilePageClient({ profile: initialProfile, requestedProfileId }: ProfilePageClientProps) {
  const { t, i18n } = useTranslation();
  const { user: currentUser, loading: authLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isHydrated, setIsHydrated] = useState(false);
  const [profile, setProfile] = useState(initialProfile);
  const [attemptedPrivateProfileLoad, setAttemptedPrivateProfileLoad] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [profileStats, setProfileStats] = useState<any>(null);
  const [myRating, setMyRating] = useState<number | null>(null);
  const [anonymousVoterId, setAnonymousVoterId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("summary");

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    setProfile(initialProfile);
  }, [initialProfile]);

  useEffect(() => {
    setAnonymousVoterId(getOrCreateAnonymousVoterId());
  }, []);

  useEffect(() => {
    if (profile || authLoading || attemptedPrivateProfileLoad || !currentUser || !requestedProfileId || String(currentUser.id) !== String(requestedProfileId)) {
      return;
    }

    const loadOwnPrivateProfile = async () => {
      try {
        const { data } = await apiClient.get(`/profiles/${requestedProfileId}`);
        setProfile(data);
      } catch (error) {
        console.error("Failed to load private profile:", error);
      } finally {
        setAttemptedPrivateProfileLoad(true);
      }
    };

    loadOwnPrivateProfile();
  }, [profile, authLoading, attemptedPrivateProfileLoad, currentUser, requestedProfileId]);

  const isManagedProfile = Boolean(profile?.is_managed_profile);
  const isOwnAccountProfile = currentUser && profile && !isManagedProfile && String(currentUser.id) === String(profile.id);
  const isManagedProfileOwner = currentUser && profile && isManagedProfile && String(currentUser.id) === String(profile.owner_user_id);
  const canEditProfile = Boolean(isOwnAccountProfile || isManagedProfileOwner);
  const canManagePlayerProfiles = currentUser?.tipo_usuario === "ofertante" && ["club", "agente", "scout"].includes(currentUser?.rol);

  useEffect(() => {
    if (!isOwnAccountProfile || !profile) return;
    const loadStats = async () => {
      try {
        const { data } = await apiClient.get(`/profiles/${profile.id}/stats`);
        setProfileStats(data);
      } catch (error) {
        console.error("Failed to load profile stats:", error);
      }
    };
    loadStats();
  }, [isOwnAccountProfile, profile]);

  useEffect(() => {
    if (!profile || canEditProfile || isManagedProfile) {
      setMyRating(null);
      return;
    }
    if (authLoading || (!currentUser && !anonymousVoterId)) return;

    const loadMyRating = async () => {
      try {
        const { data } = await apiClient.get(`/profiles/${profile.id}/my-rating`, {
          headers: anonymousVoterId ? { "x-anonymous-voter-id": anonymousVoterId } : undefined,
        });
        setMyRating(data.rating);
      } catch {
        setMyRating(null);
      }
    };

    loadMyRating();
  }, [anonymousVoterId, authLoading, currentUser, profile, canEditProfile, isManagedProfile]);

  useEffect(() => {
    if (profile && currentUser && !canEditProfile) {
      const recordView = async () => {
        try {
          await apiClient.post(`/profiles/${profile.id}/view`);
        } catch (error) {
          console.error("Failed to record profile view:", error);
        }
      };
      recordView();
    }
  }, [profile, currentUser, canEditProfile]);

  const normalizeWhatsAppUrl = (value?: string) => {
    if (!value) return "";
    const trimmed = value.trim();
    if (!trimmed) return "";
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    const digits = trimmed.replace(/[^0-9+]/g, "");
    if (!digits) return "";
    const cleaned = digits.startsWith("+") ? digits.slice(1) : digits;
    return `https://wa.me/${cleaned}`;
  };

  const handleRatingChange = async (_event: any, newValue: number | null) => {
    if (!newValue || !profile) return;
    try {
      const res = await apiClient.post(`/profiles/${profile.id}/rate`, { rating: newValue }, { headers: anonymousVoterId ? { "x-anonymous-voter-id": anonymousVoterId } : undefined });
      const updatedProfile = res.data;
      setMyRating(updatedProfile.user_rating ?? newValue);
      setProfile((prev) => prev ? { ...prev, average_rating: updatedProfile.average_rating, total_ratings: updatedProfile.total_ratings } : null);
      startTransition(() => router.refresh());
    } catch {
      alert(t("rating_error", "Hubo un error al enviar tu calificación."));
    }
  };

  const currentUrl = typeof window !== "undefined" ? window.location.href : pathname || "";

  const handleCopyLink = async () => {
    try { await navigator.clipboard.writeText(currentUrl); } catch {}
  };

  const handleShare = () => {
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`;
    window.open(shareUrl, "_blank", "noopener,noreferrer");
  };

  const handleWhatsApp = () => {
    const url = normalizeWhatsAppUrl(profile?.whatsapp_url);
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  const handleEmail = () => {
    if (profile?.email) {
      window.location.href = `mailto:${profile.email}`;
    }
  };

  const handleDownloadCv = () => {
    if (profile?.cv_url) {
      window.open(profile.cv_url, "_blank", "noopener,noreferrer");
    }
  };

  const handleOpenImageModal = () => setIsImageModalOpen(true);
  const handleCloseImageModal = () => setIsImageModalOpen(false);
  const handleOpenEditModal = () => setIsEditModalOpen(true);
  const handleCloseEditModal = () => setIsEditModalOpen(false);
  const handleProfileSave = () => {
    handleCloseEditModal();
    startTransition(() => router.refresh());
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(t("confirm_delete_account", "¿Seguro que querés eliminar tu cuenta? Se borrarán tus datos, perfiles, ofertas y postulaciones. Esta acción no se puede deshacer."));
    if (!confirmed) return;
    const typedConfirmation = window.prompt(t("confirm_delete_account_prompt", "Escribí ELIMINAR para confirmar la baja de tu cuenta."));
    if (typedConfirmation !== "ELIMINAR") return;
    try {
      await apiClient.delete("/users/me");
      localStorage.removeItem("token");
      window.location.href = "/";
    } catch (error: any) {
      alert(error.response?.data?.message || t("delete_account_error", "No se pudo eliminar la cuenta."));
    }
  };

  const age = useMemo(() => {
    if (!profile?.fecha_de_nacimiento) return "—";
    const birth = new Date(profile.fecha_de_nacimiento);
    if (Number.isNaN(birth.getTime())) return "—";
    const diff = Date.now() - birth.getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  }, [profile?.fecha_de_nacimiento]);

  if (!isHydrated) return null;
  if (!profile && authLoading) return null;
  if (!profile) {
    return <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-slate-600">{t("profile_not_found", "Perfil no encontrado.")}</div>;
  }

  const lang = i18n.language;
  const p = profile as any;
  const nacionalidad = p[`nacionalidad_${lang}`] || profile.nacionalidad;
  const posicion_principal = p[`posicion_principal_${lang}`] || profile.posicion_principal;
  const pie_dominante = p[`pie_dominante_${lang}`] || profile.pie_dominante;
  const resumen_profesional = p[`resumen_profesional_${lang}`] || profile.resumen_profesional;

  const tabs = [
    { id: "summary", label: "Resumen" },
    { id: "stats", label: "Estadísticas" },
    { id: "timeline", label: "Trayectoria" },
    { id: "gallery", label: "Galería" },
    { id: "videos", label: "Videos" },
    { id: "scouting", label: "Scouting" },
    { id: "documents", label: "Documentos" },
    { id: "contact", label: "Contacto" },
  ];

  const strengthTags = ["Velocidad", "Uno contra uno", "Juego aéreo", "Definición", "Presión alta", "Perfil izquierdo"];
  const availabilityLabel = profile.subscription_status === "activa" ? "Disponible para clubes" : "Con contrato";
  const availabilityTone = profile.subscription_status === "activa" ? "positive" as const : "neutral" as const;

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#fdfefe_100%)] px-4 py-4 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 lg:flex-row">
        <main className="flex-1">
          <HeroPlayer
            profile={profile}
            age={Number(age)}
            nationalityLabel={nacionalidad || "—"}
            availabilityLabel={availabilityLabel}
            availabilityTone={availabilityTone}
            onCopyLink={handleCopyLink}
            onShare={handleShare}
            onOpenLightbox={handleOpenImageModal}
            onWhatsApp={handleWhatsApp}
            onEmail={handleEmail}
            onDownloadCv={handleDownloadCv}
            canEditProfile={canEditProfile}
            onEditProfile={handleOpenEditModal}
            dominantFoot={pie_dominante || "—"}
            positionLabel={posicion_principal || t("not_specified", "No especificada")}
          />

          <PlayerTabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

          <div className="mt-6 space-y-6">
            {activeTab === "summary" && (
              <div className="grid gap-6 xl:grid-cols-[1.7fr_0.9fr]">
                <div className="space-y-6">
                  <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-2 text-[#071C3C]">
                      <PlayCircle size={18} />
                      <h2 className="text-xl font-semibold">Video principal</h2>
                    </div>
                    <div className="mt-4 overflow-hidden rounded-[24px] border border-slate-200 bg-slate-50">
                      <img src={profile.foto_perfil_url || "/images/logos/logofp.png"} alt="Video destacado" className="h-72 w-full object-cover" />
                      <div className="flex items-center justify-between p-4">
                        <div>
                          <p className="font-semibold text-[#071C3C]">Resumen de juego</p>
                          <p className="text-sm text-slate-500">Muestra técnica, ritmo y decisión en el campo.</p>
                        </div>
                        <button className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-[#071C3C]">Reproducir</button>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-2 text-[#071C3C]">
                      <BadgeInfo size={18} />
                      <h2 className="text-xl font-semibold">Descripción corta</h2>
                    </div>
                    <p className="mt-4 text-base leading-7 text-slate-600">{resumen_profesional || t("no_summary_available", "Sin resumen disponible.")}</p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {strengthTags.map((tag) => (
                        <span key={tag} className="rounded-full bg-[#071C3C]/5 px-3 py-2 text-sm font-medium text-[#071C3C]">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-2 text-[#071C3C]">
                      <BadgeCheck size={18} />
                      <h2 className="text-xl font-semibold">Información personal</h2>
                    </div>
                    <div className="mt-4 space-y-3 text-sm text-slate-600">
                      <div className="flex justify-between border-b border-slate-100 pb-2"><span>Nombre</span><span className="font-medium text-[#071C3C]">{profile.nombre} {profile.apellido}</span></div>
                      <div className="flex justify-between border-b border-slate-100 pb-2"><span>Nacimiento</span><span className="font-medium text-[#071C3C]">{profile.fecha_de_nacimiento || "—"}</span></div>
                      <div className="flex justify-between border-b border-slate-100 pb-2"><span>Nacionalidad</span><span className="font-medium text-[#071C3C]">{nacionalidad || "—"}</span></div>
                      <div className="flex justify-between border-b border-slate-100 pb-2"><span>Pasaporte</span><span className="font-medium text-[#071C3C]">{profile.email ? "Disponible" : "—"}</span></div>
                      <div className="flex justify-between border-b border-slate-100 pb-2"><span>Altura</span><span className="font-medium text-[#071C3C]">{profile.altura_cm ? `${profile.altura_cm} cm` : "—"}</span></div>
                      <div className="flex justify-between border-b border-slate-100 pb-2"><span>Peso</span><span className="font-medium text-[#071C3C]">{profile.peso_kg ? `${profile.peso_kg} kg` : "—"}</span></div>
                      <div className="flex justify-between border-b border-slate-100 pb-2"><span>Pierna hábil</span><span className="font-medium text-[#071C3C]">{pie_dominante || "—"}</span></div>
                      <div className="flex justify-between border-b border-slate-100 pb-2"><span>Representante</span><span className="font-medium text-[#071C3C]">{profile.agente_nombre || "—"}</span></div>
                      <div className="flex justify-between pb-2"><span>Disponibilidad</span><span className="font-medium text-[#25D366]">{availabilityLabel}</span></div>
                    </div>
                  </div>

                  <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-2 text-[#071C3C]">
                      <Users size={18} />
                      <h2 className="text-xl font-semibold">Calificación</h2>
                    </div>
                    <div className="mt-4 flex items-center gap-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} size={18} className={star <= Math.round(Number(profile.average_rating || 0)) ? "fill-[#25D366] text-[#25D366]" : "text-slate-300"} />
                      ))}
                      <span className="text-sm font-semibold text-[#071C3C]">{Number(profile.average_rating || 0).toFixed(1)} / 5</span>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-3">
                      {!canEditProfile && (
                        <button onClick={() => handleRatingChange(null, 5)} className="rounded-full bg-[#071C3C] px-4 py-2 text-sm font-semibold text-white">Calificar 5★</button>
                      )}
                      {canEditProfile && (
                        <button onClick={handleOpenEditModal} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-[#071C3C]">Editar perfil</button>
                      )}
                      <button onClick={handleCopyLink} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-[#071C3C]">Copiar enlace</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "stats" && <PlayerStats />}
            {activeTab === "timeline" && <PlayerTimeline />}
            {activeTab === "gallery" && (
              <div className="space-y-6">
                <PlayerGallery imageUrl={profile.foto_perfil_url || "/images/logos/logofp.png"} />
                <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-4 flex items-center gap-2 text-[#071C3C]">
                    <ImageIcon size={18} />
                    <h2 className="text-xl font-semibold">Galería del jugador</h2>
                  </div>
                  <UserPhotosSection userId={profile.id} isMyProfile={canEditProfile} />
                </div>
              </div>
            )}
            {activeTab === "videos" && (
              <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-2 text-[#071C3C]">
                  <PlayCircle size={18} />
                  <h2 className="text-xl font-semibold">Videos</h2>
                </div>
                <VideosSection userId={profile.id} isMyProfile={canEditProfile} createEndpoint={isManagedProfile ? `/profiles/${profile.id}/videos` : "/profiles/videos"} updateEndpointBuilder={(videoId) => isManagedProfile ? `/profiles/managed-videos/${videoId}` : `/profiles/videos/${videoId}`} deleteEndpointBuilder={(videoId) => isManagedProfile ? `/profiles/managed-videos/${videoId}` : `/profiles/videos/${videoId}`} />
              </div>
            )}
            {activeTab === "scouting" && (
              <div className="space-y-6">
                <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-4 flex items-center gap-2 text-[#071C3C]">
                    <TrendingUp size={18} />
                    <h2 className="text-xl font-semibold">Informes de Scouting</h2>
                  </div>
                  {!isManagedProfile && <ScoutingReportsSection userId={profile.id} isMyProfile={Boolean(isOwnAccountProfile)} />}
                </div>
                <PlayerScouting />
              </div>
            )}
            {activeTab === "documents" && (
              <div className="space-y-6">
                <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-4 flex items-center gap-2 text-[#071C3C]">
                    <FileText size={18} />
                    <h2 className="text-xl font-semibold">Documentos y CV</h2>
                  </div>
                  <PlayerDocuments />
                </div>
              </div>
            )}
            {activeTab === "contact" && (
              <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                <PlayerContact email={profile.email} whatsappUrl={profile.whatsapp_url} instagramUrl={profile.instagram_url} linkedinUrl={profile.linkedin_url} websiteUrl={profile.transfermarkt_url} onWhatsApp={handleWhatsApp} onEmail={handleEmail} />
                <PlayerShare link={currentUrl} onCopy={handleCopyLink} />
              </div>
            )}
          </div>

          {(isOwnAccountProfile && canManagePlayerProfiles) && <div className="mt-6"><ManagedPlayerProfilesSection /></div>}
          {isOwnAccountProfile && <div className="mt-6"><MyApplicationsSection userId={profile.id} /></div>}
          {isOwnAccountProfile && currentUser?.tipo_usuario === "ofertante" && <div className="mt-6"><MyOffersSection userId={profile.id} /></div>}

          {isOwnAccountProfile && (
            <div className="mt-6 rounded-[28px] border border-red-200 bg-red-50 p-6 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-lg font-semibold text-red-700">Eliminar cuenta</p>
                  <p className="mt-1 text-sm text-red-600">Da de baja tu cuenta y elimina tus datos asociados de FutbolProyect.</p>
                </div>
                <button onClick={handleDeleteAccount} className="rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-700">Eliminar cuenta</button>
              </div>
            </div>
          )}

          <div className="mt-6">
            <AdBanner placement="player_profile_sidebar" compact />
          </div>
        </main>

        <PlayerSidebar imageUrl={profile.foto_perfil_url || "/images/logos/logofp.png"} name={`${profile.nombre} ${profile.apellido}`} availabilityLabel={availabilityLabel} onCopyLink={handleCopyLink} onShare={handleShare} onWhatsApp={handleWhatsApp} onDownloadCv={handleDownloadCv} />
      </div>

      {canEditProfile && (
        <EditProfileModal open={isEditModalOpen} onClose={handleCloseEditModal} profileData={profile} onSave={handleProfileSave} saveEndpoint={isManagedProfile ? `/profiles/managed/${String(profile.id).replace("managed-", "")}` : "/profiles/me"} showEmailField={isManagedProfile} />
      )}

      {isImageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={handleCloseImageModal}>
          <div className="max-h-[90vh] max-w-4xl overflow-hidden rounded-[24px] bg-white p-2" onClick={(event) => event.stopPropagation()}>
            <img src={profile.foto_perfil_url || "/images/logos/logofp.png"} alt={profile.nombre} className="max-h-[80vh] max-w-full object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}
