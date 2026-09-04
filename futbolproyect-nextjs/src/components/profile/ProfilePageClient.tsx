"use client";

import React, { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { Profile, UserPhoto, Video } from "@/lib/types";
import { useTranslation } from "react-i18next";
import apiClient from "@/lib/apiClient";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { HeroPlayer } from "./HeroPlayer";
import { PlayerTabs } from "./PlayerTabs";
import { PlayerStats } from "./PlayerStats";
import { PlayerTimeline } from "./PlayerTimeline";
import { PlayerContact } from "./PlayerContact";
import { PlayerSidebar } from "./PlayerSidebar";
import { PlayerShare } from "./PlayerShare";
import { PlayerDocuments } from "./PlayerDocuments";
import EditProfileModal from "./EditProfileModal";
import ChangePasswordModal from "./ChangePasswordModal";
import VideosSection from "./VideosSection";
import UserPhotosSection from "./UserPhotosSection";
import ScoutingReportsSection from "./ScoutingReportsSection";
import MyApplicationsSection from "./MyApplicationsSection";
import MyOffersSection from "./MyOffersSection";
import ManagedPlayerProfilesSection from "./ManagedPlayerProfilesSection";
import AdBanner from "@/components/ads/AdBanner";
import { ArrowRight, BadgeCheck, BadgeInfo, CalendarRange, CheckCircle2, Compass, Eye, FileText, ImageIcon, KeyRound, MessageCircle, PlayCircle, Sparkles, Star, TrendingUp, Users } from "lucide-react";
import { toast } from "react-toastify";
import html2canvas from "html2canvas";
import { getProfileCompletion } from "@/lib/seoSlugs";
import { getSafeClubLogoUrl } from "@/lib/clubCrests";
import { hasCompatibleActiveSubscription } from "@/lib/subscriptionAccess";
import ProfileActionGateDialog from "./ProfileActionGateDialog";
import LazyYouTubeEmbed from "@/components/media/LazyYouTubeEmbed";

interface ProfilePageClientProps {
  profile: Profile | null;
  requestedProfileId?: string;
}

const ANONYMOUS_VOTER_ID_KEY = "fp_anonymous_voter_id";

const parseDateOnly = (value?: string | null) => {
  if (!value) return null;
  const trimmed = String(value).trim();
  const dateOnlyMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (dateOnlyMatch) {
    const [, year, month, day] = dateOnlyMatch;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }
  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatDateOnly = (value?: string | null) => {
  const parsed = parseDateOnly(value);
  if (!parsed) return "";
  return parsed.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });
};

const parseCvStats = (value?: string | null) => {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return Object.entries(parsed)
        .filter(([, itemValue]) => String(itemValue || "").trim())
        .map(([label, itemValue]) => ({
          label: label.replace(/_/g, " "),
          value: String(itemValue),
        }));
    }
  } catch {}

  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, ...rest] = line.split(":");
      return { label, value: rest.join(":").trim() };
    });
};

const parseCvCareer = (value?: string | null) => {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed
        .map((row) => ({
          year: String(row.year || ""),
          club: String(row.club || ""),
          detail: [row.league || row.category, row.country].filter(Boolean).join(" · "),
          logoUrl: getSafeClubLogoUrl(row.logo_url),
        }))
        .filter((row) => row.year || row.club || row.detail);
    }
  } catch {}

  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => ({ year: "", club: line, detail: "", logoUrl: "" }));
};

const getCvImageSource = (value?: string | null) => {
  const source = String(value || "").trim();
  if (!source) return "/images/logos/logofp.png";
  if (!/^https?:\/\//i.test(source)) return source;
  return `/api/profile-image?url=${encodeURIComponent(source)}`;
};

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
  const [profile, setProfile] = useState(initialProfile);
  const [attemptedPrivateProfileLoad, setAttemptedPrivateProfileLoad] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isProfileActionGateOpen, setIsProfileActionGateOpen] = useState(false);
  const [profileStats, setProfileStats] = useState<any>(null);
  const [myRating, setMyRating] = useState<number | null>(null);
  const [anonymousVoterId, setAnonymousVoterId] = useState<string | null>(null);
  const [featuredVideo, setFeaturedVideo] = useState<Video | null>(null);
  const [summaryPhotos, setSummaryPhotos] = useState<UserPhoto[]>([]);
  const [activeTab, setActiveTab] = useState("summary");
  const cvTemplateRef = useRef<HTMLDivElement>(null);

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
    if (!profile?.id) {
      setFeaturedVideo(null);
      setSummaryPhotos([]);
      return;
    }

    const loadFeaturedMedia = async () => {
      try {
        const [videosResponse, photosResponse] = await Promise.all([
          apiClient.get(`/profiles/${profile.id}/videos`),
          apiClient.get(`/profiles/${profile.id}/photos`),
        ]);
        const videos = Array.isArray(videosResponse.data) ? videosResponse.data : [];
        const photos = Array.isArray(photosResponse.data) ? photosResponse.data : [];
        const sortedVideos = [...videos].sort((a, b) => (Number(a.position) || 0) - (Number(b.position) || 0));
        setFeaturedVideo(sortedVideos[0] ?? null);
        setSummaryPhotos(photos.slice(0, 5));
      } catch {
        setFeaturedVideo(null);
        setSummaryPhotos([]);
      }
    };

    loadFeaturedMedia();
  }, [profile?.id]);

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

    const whatsappMatch = trimmed.match(/(?:https?:\/\/)?(?:wa\.me\/|api\.whatsapp\.com\/send\?phone=)([\d+]+)/i);
    if (whatsappMatch) {
      const normalizedPhone = whatsappMatch[1].replace(/^\+/, "");
      return `https://wa.me/${normalizedPhone}`;
    }

    const onlyNumbers = trimmed.replace(/[^\d+]/g, "");
    if (!onlyNumbers || onlyNumbers === "+") return "";

    const hasPlus = onlyNumbers.startsWith("+");
    const digits = onlyNumbers.replace(/\+/g, "");
    if (digits.length < 8 || digits.length > 15) return "";

    return `https://wa.me/${hasPlus ? "+" : ""}${digits}`;
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

  const canUseProfileActions = Boolean(
    currentUser && hasCompatibleActiveSubscription(currentUser),
  );

  const requireProfileActionAccess = () => {
    if (authLoading) return false;
    if (canUseProfileActions) return true;

    setIsProfileActionGateOpen(true);
    return false;
  };

  const handleCopyLink = async () => {
    if (!requireProfileActionAccess()) return;
    try { await navigator.clipboard.writeText(currentUrl); } catch {}
  };

  const handleShare = async () => {
    if (!requireProfileActionAccess()) return;
    const title = profile ? `${profile.nombre} ${profile.apellido || ""}`.trim() : t("futbolproyect_profile");

    try {
      if (navigator.share) {
        await navigator.share({
          title,
          text: t("share_profile_short_message"),
          url: currentUrl,
        });
        return;
      }

      await navigator.clipboard.writeText(currentUrl);
      alert(t("profile_link_copied", "Enlace del perfil copiado."));
    } catch {
      try {
        await navigator.clipboard.writeText(currentUrl);
        alert(t("profile_link_copied", "Enlace del perfil copiado."));
      } catch {
        alert(t("profile_share_error", "No se pudo compartir el perfil."));
      }
    }
  };

  const handleProfileActionDestination = (url: string) => {
    if (!requireProfileActionAccess()) return;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleWhatsApp = () => {
    if (!requireProfileActionAccess()) return;
    const url = normalizeWhatsAppUrl(profile?.whatsapp_url);
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  const handleEmail = () => {
    const email = String(profile?.email || "").trim();
    if (!email) {
      toast.info(t("profile_email_missing"));
      return;
    }

    const subject = encodeURIComponent(t("profile_contact_email_subject"));
    const body = encodeURIComponent(
      t("profile_contact_email_body", { name: profile?.nombre || "" }),
    );
    const mailtoUrl = `mailto:${email}?subject=${subject}&body=${body}`;

    navigator.clipboard?.writeText(email).catch(() => undefined);
    toast.success(t("profile_email_copied", { email }));

    const link = document.createElement("a");
    link.href = mailtoUrl;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleDownloadCv = async () => {
    if (!requireProfileActionAccess()) return;
    if (!profile || !cvTemplateRef.current) return;

    const toastId = toast.loading(t("generating_profile_cv"));
    try {
      const pendingImages = Array.from(
        cvTemplateRef.current.querySelectorAll("img"),
      ).filter((image) => !image.complete);
      await Promise.all(
        pendingImages.map(
          (image) =>
            new Promise<void>((resolve) => {
              const finish = () => resolve();
              image.addEventListener("load", finish, { once: true });
              image.addEventListener("error", finish, { once: true });
              window.setTimeout(finish, 4000);
            }),
        ),
      );

      const canvas = await html2canvas(cvTemplateRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });
      const fullName = `${profile.nombre || ""}-${profile.apellido || ""}`
        .trim()
        .replace(/\s+/g, "-");
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `${fullName || "perfil"}-FutbolProyect-CV.png`;
      link.click();
      toast.update(toastId, {
        render: t("profile_cv_downloaded"),
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
    } catch (error) {
      console.error("Error generating profile CV:", error);
      toast.update(toastId, {
        render: t("profile_cv_generation_error"),
        type: "error",
        isLoading: false,
        autoClose: 5000,
      });
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
    const birth = parseDateOnly(profile?.fecha_de_nacimiento);
    if (!birth) return null;

    const today = new Date();
    let calculatedAge = today.getFullYear() - birth.getFullYear();
    const hasHadBirthdayThisYear = today.getMonth() > birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() >= birth.getDate());

    if (!hasHadBirthdayThisYear) {
      calculatedAge -= 1;
    }

    return calculatedAge;
  }, [profile?.fecha_de_nacimiento]);

  const localCompletionPercent = useMemo(() => {
    if (!profile) return 0;
    return getProfileCompletion(profile);
  }, [profile]);

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
  const idiomas = profile.idiomas || "";
  const disponibilidad = profile.disponibilidad || "";

  const tabs = [
    { id: "summary", label: t("profile_tab_summary") },
    { id: "stats", label: t("profile_tab_stats") },
    { id: "timeline", label: t("profile_tab_timeline") },
    { id: "gallery", label: t("profile_tab_gallery") },
    { id: "videos", label: t("profile_tab_videos") },
    { id: "scouting", label: "Scouting" },
    { id: "documents", label: t("profile_tab_documents") },
    { id: "contact", label: t("contact") },
  ];

  const availabilityLabel = disponibilidad || t("availability_not_specified");
  const normalizedAvailability = availabilityLabel.toLowerCase();
  const availabilityTone = normalizedAvailability.includes("disponible") || normalizedAvailability.includes("libre") ? "positive" as const : "neutral" as const;
  const profileViews = Number(profileStats?.profile_views ?? profile.profile_views ?? 0);
  const completionPercent = Number(profileStats?.completion_percent ?? localCompletionPercent);
  const cvStats = parseCvStats(profile.estadisticas);
  const cvCareer = parseCvCareer(profile.trayectoria);

  return (
    <div className="min-h-screen max-w-full overflow-x-clip bg-[linear-gradient(180deg,#f8fafc_0%,#fdfefe_100%)] px-4 py-4 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto flex w-full min-w-0 max-w-7xl flex-col gap-6 lg:flex-row">
        <div className="w-full min-w-0 flex-1">
          <HeroPlayer
            profile={profile}
            age={age}
            birthDateLabel={formatDateOnly(profile.fecha_de_nacimiento)}
            nationalityLabel={nacionalidad || ""}
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
            dominantFoot={pie_dominante || ""}
            positionLabel={posicion_principal || ""}
            languagesLabel={idiomas}
          />

          <PlayerTabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

          <div className="mt-6 min-w-0 space-y-6">
            {activeTab === "summary" && (
              <div className="grid gap-6 xl:grid-cols-[1.7fr_0.9fr]">
                <div className="min-w-0 space-y-6">
                  <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-2 text-[#071C3C]">
                      <PlayCircle size={18} />
                      <h2 className="text-xl font-semibold">{t("featured_video", "Video principal")}</h2>
                    </div>
                    <div className="mt-4 overflow-hidden rounded-[24px] border border-slate-200 bg-slate-50">
                      {featuredVideo && featuredVideo.youtube_url ? (
                        <>
                          <div className="relative aspect-video w-full bg-black">
                            <LazyYouTubeEmbed
                              youtubeUrl={featuredVideo.youtube_url}
                              coverImageUrl={featuredVideo.cover_image_url}
                              title={featuredVideo.title || "Video destacado"}
                            />
                          </div>
                          <div className="flex items-center justify-between p-4">
                            <div>
                              <p className="font-semibold text-[#071C3C]">{featuredVideo.title || "Video destacado"}</p>
                              <p className="text-sm text-slate-500">{t("first_user_video", "Primer video cargado por el usuario.")}</p>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="flex h-72 items-center justify-center p-6 text-center text-sm text-slate-500">
                          {t("no_videos_uploaded")}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-2 text-[#071C3C]">
                      <ImageIcon size={18} />
                      <h2 className="text-xl font-semibold">{t("photo_gallery", "Galería de fotos")}</h2>
                    </div>
                    {summaryPhotos.length > 0 ? (
                      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
                        {summaryPhotos.map((photo) => (
                          <button
                            key={photo.id}
                            type="button"
                            className="aspect-[4/3] overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
                            onClick={() => setActiveTab("gallery")}
                            aria-label={photo.title || t("view_profile_photo")}
                          >
                            <img src={photo.url} alt={photo.title || t("profile_photo_alt")} className="h-full w-full object-cover transition duration-300 hover:scale-105" />
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-4 text-sm text-slate-500">{t("no_photos_uploaded", "Aún no hay fotos cargadas.")}</p>
                    )}
                  </div>

                  <PlayerStats stats={profile.estadisticas} />
                  <PlayerTimeline timeline={profile.trayectoria} />

                  {!isManagedProfile && (
                    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                      <div className="mb-1 flex items-center gap-2 text-[#071C3C]">
                        <TrendingUp size={18} />
                        <h2 className="text-xl font-semibold">{t("scouting_analysis", "Análisis de scouting")}</h2>
                      </div>
                      <ScoutingReportsSection userId={profile.id} isMyProfile={Boolean(isOwnAccountProfile)} />
                    </div>
                  )}

                  <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-2 text-[#071C3C]">
                      <BadgeInfo size={18} />
                      <h2 className="text-xl font-semibold">{t("short_description", "Descripción corta")}</h2>
                    </div>
                    {resumen_profesional ? (
                      <p className="mt-4 break-words text-base leading-7 text-slate-600">{resumen_profesional}</p>
                    ) : (
                      <p className="mt-4 text-sm text-slate-500">{t("no_description_uploaded", "Aún no hay una descripción cargada.")}</p>
                    )}
                  </div>
                </div>

                <div className="min-w-0 space-y-6">
                  <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-2 text-[#071C3C]">
                      <BadgeCheck size={18} />
                      <h2 className="text-xl font-semibold">{t("personal_information", "Información personal")}</h2>
                    </div>
                    <div className="mt-4 space-y-3 text-sm text-slate-600">
                      <div className="flex justify-between border-b border-slate-100 pb-2"><span>{t("name", "Nombre")}</span><span className="font-medium text-[#071C3C]">{profile.nombre} {profile.apellido}</span></div>
                      <div className="flex justify-between border-b border-slate-100 pb-2"><span>{t("birth_date", "Nacimiento")}</span><span className="font-medium text-[#071C3C]">{formatDateOnly(profile.fecha_de_nacimiento) || ""}</span></div>
                      <div className="flex justify-between border-b border-slate-100 pb-2"><span>{t("nationality", "Nacionalidad")}</span><span className="font-medium text-[#071C3C]">{nacionalidad || ""}</span></div>
                      <div className="flex justify-between border-b border-slate-100 pb-2"><span>{t("height", "Altura")}</span><span className="font-medium text-[#071C3C]">{profile.altura_cm ? `${profile.altura_cm} cm` : ""}</span></div>
                      <div className="flex justify-between border-b border-slate-100 pb-2"><span>{t("weight", "Peso")}</span><span className="font-medium text-[#071C3C]">{profile.peso_kg ? `${profile.peso_kg} kg` : ""}</span></div>
                      <div className="flex justify-between border-b border-slate-100 pb-2"><span>{t("preferred_foot", "Pierna hábil")}</span><span className="font-medium text-[#071C3C]">{pie_dominante || ""}</span></div>
                      <div className="flex justify-between border-b border-slate-100 pb-2"><span>{t("languages", "Idiomas")}</span><span className="font-medium text-[#071C3C]">{idiomas || ""}</span></div>
                      <div className="flex justify-between border-b border-slate-100 pb-2"><span>{t("representative", "Representante")}</span><span className="font-medium text-[#071C3C]">{profile.agente_nombre || ""}</span></div>
                      <div className="flex justify-between pb-2"><span>{t("availability", "Disponibilidad")}</span><span className="font-medium text-[#25D366]">{availabilityLabel}</span></div>
                    </div>
                  </div>

                  <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-2 text-[#071C3C]">
                      <Users size={18} />
                      <h2 className="text-xl font-semibold">{t("rating", "Calificación")}</h2>
                    </div>
                    <div className="mt-4 flex items-center gap-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} size={18} className={star <= Math.round(Number(profile.average_rating || 0)) ? "fill-[#25D366] text-[#25D366]" : "text-slate-300"} />
                      ))}
                      <span className="text-sm font-semibold text-[#071C3C]">{Number(profile.average_rating || 0).toFixed(1)} / 5</span>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-3">
                      {!canEditProfile && (
                        <div className="flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2">
                          <span className="text-xs font-semibold uppercase text-slate-500">{t("your_vote", "Tu voto")}</span>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => handleRatingChange(null, star)}
                              className="text-[#25D366] transition hover:scale-110"
                              aria-label={`Calificar con ${star} estrella${star === 1 ? "" : "s"}`}
                            >
                              <Star size={18} className={star <= Number(myRating || 0) ? "fill-[#25D366]" : "text-slate-300"} />
                            </button>
                          ))}
                        </div>
                      )}
                      {canEditProfile && (
                        <button onClick={handleOpenEditModal} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-[#071C3C]">{t("edit_profile", "Editar perfil")}</button>
                      )}
                      <button onClick={handleCopyLink} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-[#071C3C]">{t("copy_link", "Copiar enlace")}</button>
                    </div>
                  </div>

                  <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-2 text-[#071C3C]">
                      <TrendingUp size={18} />
                      <h2 className="text-xl font-semibold">{t("profile_activity", "Actividad del perfil")}</h2>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="min-w-0 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                        <Eye size={20} className="text-[#25D366]" />
                        <p className="mt-3 break-words text-2xl font-extrabold leading-none text-[#071C3C]">{profileViews}</p>
                        <p className="mt-2 text-xs font-semibold uppercase text-slate-500">{t("profile_views", "Visitas al perfil")}</p>
                      </div>
                      <div className="min-w-0 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                        <CheckCircle2 size={20} className="text-[#25D366]" />
                        <p className="mt-3 break-words text-2xl font-extrabold leading-none text-[#071C3C]">{completionPercent}%</p>
                        <p className="mt-2 text-xs font-semibold uppercase text-slate-500">{t("profile_completed", "Perfil completado")}</p>
                      </div>
                    </div>
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-[#25D366] transition-all" style={{ width: `${Math.min(100, Math.max(0, completionPercent))}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "stats" && <PlayerStats stats={profile.estadisticas} />}
            {activeTab === "timeline" && <PlayerTimeline timeline={profile.trayectoria} />}
            {activeTab === "gallery" && (
              <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-2 text-[#071C3C]">
                  <ImageIcon size={18} />
                  <h2 className="text-xl font-semibold">{t("player_gallery", "Galería del jugador")}</h2>
                </div>
                <UserPhotosSection userId={profile.id} isMyProfile={canEditProfile} />
              </div>
            )}
            {activeTab === "videos" && (
              <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-2 text-[#071C3C]">
                  <PlayCircle size={18} />
                  <h2 className="text-xl font-semibold">{t("videos", "Videos")}</h2>
                </div>
                <VideosSection userId={profile.id} isMyProfile={canEditProfile} createEndpoint={isManagedProfile ? `/profiles/${profile.id}/videos` : "/profiles/videos"} updateEndpointBuilder={(videoId) => isManagedProfile ? `/profiles/managed-videos/${videoId}` : `/profiles/videos/${videoId}`} deleteEndpointBuilder={(videoId) => isManagedProfile ? `/profiles/managed-videos/${videoId}` : `/profiles/videos/${videoId}`} />
              </div>
            )}
            {activeTab === "scouting" && (
              <div className="space-y-6">
                <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-4 flex items-center gap-2 text-[#071C3C]">
                    <TrendingUp size={18} />
                    <h2 className="text-xl font-semibold">{t("scouting_reports", "Informes de Scouting")}</h2>
                  </div>
                  {!isManagedProfile && <ScoutingReportsSection userId={profile.id} isMyProfile={Boolean(isOwnAccountProfile)} />}
                </div>
              </div>
            )}
            {activeTab === "documents" && (
              <div className="space-y-6">
                <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-4 flex items-center gap-2 text-[#071C3C]">
                    <FileText size={18} />
                    <h2 className="text-xl font-semibold">{t("documents_and_cv", "Documentos y CV")}</h2>
                  </div>
                  <PlayerDocuments cvUrl={profile.cv_url} onOpenCv={handleProfileActionDestination} />
                </div>
              </div>
            )}
            {activeTab === "contact" && (
              <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                <PlayerContact email={profile.email} whatsappUrl={profile.whatsapp_url} instagramUrl={profile.instagram_url} linkedinUrl={profile.linkedin_url} websiteUrl={profile.transfermarkt_url} onWhatsApp={handleWhatsApp} onEmail={handleEmail} />
                <PlayerShare link={currentUrl} onCopy={handleCopyLink} onShare={handleProfileActionDestination} />
              </div>
            )}
          </div>

          {(isOwnAccountProfile && canManagePlayerProfiles) && <div className="mt-6"><ManagedPlayerProfilesSection /></div>}
          {isOwnAccountProfile && <div className="mt-6"><MyApplicationsSection userId={profile.id} /></div>}
          {isOwnAccountProfile && currentUser?.tipo_usuario === "ofertante" && <div className="mt-6"><MyOffersSection userId={profile.id} /></div>}

          {isOwnAccountProfile && (
            <div className="mt-6 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-slate-100 p-2 text-[#071C3C]">
                    <KeyRound size={20} />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-[#071C3C]">{t("security", "Seguridad")}</p>
                    <p className="mt-1 text-sm text-slate-600">{t("update_password_help", "Actualizá la contraseña de acceso a tu cuenta.")}</p>
                  </div>
                </div>
                <button onClick={() => setIsPasswordModalOpen(true)} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-[#071C3C] transition hover:bg-slate-50">{t("change_password", "Cambiar contraseña")}</button>
              </div>
            </div>
          )}

          {isOwnAccountProfile && (
            <div className="mt-6 rounded-[28px] border border-red-200 bg-red-50 p-6 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-lg font-semibold text-red-700">{t("delete_account", "Eliminar cuenta")}</p>
                  <p className="mt-1 text-sm text-red-600">{t("delete_account_help", "Da de baja tu cuenta y elimina tus datos asociados de FutbolProyect.")}</p>
                </div>
                <button onClick={handleDeleteAccount} className="rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-700">{t("delete_account", "Eliminar cuenta")}</button>
              </div>
            </div>
          )}

          <div className="mt-6">
            <AdBanner placement="player_profile_sidebar" compact />
          </div>
        </div>

        <PlayerSidebar imageUrl={profile.foto_perfil_url || "/images/logos/logofp.png"} name={`${profile.nombre} ${profile.apellido}`} availabilityLabel={availabilityLabel} onCopyLink={handleCopyLink} onShare={handleShare} onWhatsApp={handleWhatsApp} onDownloadCv={handleDownloadCv} />
      </div>

      {canEditProfile && (
        <EditProfileModal open={isEditModalOpen} onClose={handleCloseEditModal} profileData={profile} onSave={handleProfileSave} saveEndpoint={isManagedProfile ? `/profiles/managed/${String(profile.id).replace("managed-", "")}` : "/profiles/me"} showEmailField={isManagedProfile} />
      )}

      {isOwnAccountProfile && (
        <ChangePasswordModal
          open={isPasswordModalOpen}
          onClose={() => setIsPasswordModalOpen(false)}
        />
      )}

      <ProfileActionGateDialog
        open={isProfileActionGateOpen}
        isRegistered={Boolean(currentUser)}
        onClose={() => setIsProfileActionGateOpen(false)}
      />

      <div
        ref={cvTemplateRef}
        aria-hidden="true"
        style={{
          position: "fixed",
          left: "-10000px",
          top: 0,
          width: 794,
          minHeight: 1123,
          padding: 48,
          color: "#152238",
          background: "#ffffff",
          fontFamily: "Arial, sans-serif",
          zIndex: -1,
        }}
      >
        <div style={{ display: "flex", gap: 30, padding: 28, borderRadius: 24, color: "#ffffff", background: "linear-gradient(135deg, #071c3c, #0b4385)" }}>
          <img
            src={getCvImageSource(profile.foto_perfil_url)}
            alt=""
            style={{ width: 170, height: 190, borderRadius: 18, objectFit: "cover", border: "4px solid rgba(255,255,255,.8)" }}
          />
          <div style={{ flex: 1, paddingTop: 8 }}>
            <div style={{ color: "#62a8ff", fontSize: 13, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>FutbolProyect</div>
            <div style={{ margin: "12px 0 4px", fontSize: 34, lineHeight: 1.1, fontWeight: 700 }}>{profile.nombre} {profile.apellido}</div>
            <div style={{ fontSize: 19, color: "#dbeafe" }}>{posicion_principal || t("position_not_specified")}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 9, marginTop: 20 }}>
              {[nacionalidad, age !== null ? t("age_years", { age }) : "", availabilityLabel]
                .filter(Boolean)
                .map((item) => (
                  <span key={String(item)} style={{ padding: "7px 12px", borderRadius: 20, background: "rgba(255,255,255,.12)", fontSize: 13 }}>
                    {item}
                  </span>
                ))}
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 30, marginTop: 30 }}>
          <aside style={{ padding: 22, borderRadius: 20, background: "#f1f6fc" }}>
            <h2 style={{ margin: 0, color: "#071c3c", fontSize: 17 }}>{t("personal_data_title")}</h2>
            {[
              [t("birth_date_placeholder"), formatDateOnly(profile.fecha_de_nacimiento)],
              [t("height_placeholder"), profile.altura_cm ? `${profile.altura_cm} cm` : ""],
              [t("weight_placeholder"), profile.peso_kg ? `${profile.peso_kg} kg` : ""],
              [t("dominant_foot_placeholder"), pie_dominante],
              [t("languages_placeholder"), idiomas],
            ].filter(([, value]) => value).map(([label, value]) => (
              <div key={String(label)} style={{ marginTop: 17, paddingBottom: 11, borderBottom: "1px solid #d8e2ee" }}>
                <div style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase" }}>{label}</div>
                <div style={{ marginTop: 4, color: "#152238", fontSize: 14, fontWeight: 700 }}>{value}</div>
              </div>
            ))}

            <h2 style={{ margin: "28px 0 0", color: "#071c3c", fontSize: 17 }}>{t("contact")}</h2>
            {[profile.email, profile.telefono, profile.agente_contacto]
              .filter(Boolean)
              .map((value) => (
                <div key={String(value)} style={{ marginTop: 12, overflowWrap: "anywhere", color: "#334155", fontSize: 13 }}>{value}</div>
              ))}
          </aside>

          <div>
            <section>
              <h2 style={{ margin: 0, paddingBottom: 8, borderBottom: "3px solid #1262db", color: "#071c3c", fontSize: 18 }}>{t("professional_summary_placeholder")}</h2>
              <p style={{ margin: "13px 0 0", color: "#475569", fontSize: 14, lineHeight: 1.65, whiteSpace: "pre-wrap" }}>
                {resumen_profesional || t("not_specified")}
              </p>
            </section>

            {cvStats.length > 0 && (
              <section style={{ marginTop: 28 }}>
                <h2 style={{ margin: 0, paddingBottom: 8, borderBottom: "3px solid #1262db", color: "#071c3c", fontSize: 18 }}>{t("stats_placeholder")}</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginTop: 14 }}>
                  {cvStats.map((item) => (
                    <div key={`${item.label}-${item.value}`} style={{ padding: 12, borderRadius: 12, textAlign: "center", background: "#f1f6fc" }}>
                      <div style={{ color: "#071c3c", fontSize: 20, fontWeight: 800 }}>{item.value}</div>
                      <div style={{ marginTop: 4, color: "#64748b", fontSize: 10, textTransform: "uppercase" }}>{item.label}</div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {cvCareer.length > 0 && (
              <section style={{ marginTop: 28 }}>
                <h2 style={{ margin: 0, paddingBottom: 8, borderBottom: "3px solid #1262db", color: "#071c3c", fontSize: 18 }}>{t("career_path_placeholder")}</h2>
                <div style={{ marginTop: 12 }}>
                  {cvCareer.map((row, index) => (
                    <div key={`${row.year}-${row.club}-${index}`} style={{ display: "grid", gridTemplateColumns: "70px 42px 1fr", gap: 12, alignItems: "center", padding: "10px 0", borderBottom: "1px solid #e2e8f0" }}>
                      <strong style={{ color: "#1262db", fontSize: 13 }}>{row.year}</strong>
                      {row.logoUrl ? (
                        <img
                          src={getCvImageSource(row.logoUrl)}
                          alt=""
                          style={{ width: 38, height: 38, objectFit: "contain" }}
                        />
                      ) : (
                        <span />
                      )}
                      <div>
                        <div style={{ color: "#152238", fontSize: 14, fontWeight: 700 }}>{row.club}</div>
                        {row.detail && <div style={{ marginTop: 3, color: "#64748b", fontSize: 12 }}>{row.detail}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>

        <div style={{ marginTop: 34, paddingTop: 14, borderTop: "1px solid #d8e2ee", color: "#64748b", fontSize: 11, textAlign: "center" }}>
          {t("generated_profile_cv_footer")}
        </div>
      </div>

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
