"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from "@mui/material";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import LanguageRoundedIcon from "@mui/icons-material/LanguageRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";

type HeaderProps = {
  onShowLoginModal: () => void;
  onShowRegisterModal: (role: string) => void;
  onShowCreateOfferModal: () => void;
};

const navItems = [
  { href: "/", key: "home", fallback: "Inicio" },
  { href: "/all-offers", key: "offers", fallback: "Ofertas" },
  { href: "/perfiles", key: "all_profiles", fallback: "Perfiles" },
  { href: "/blog", key: "blog", fallback: "Blog" },
  {
    href: "/publicidad",
    key: "advertise_with_us",
    fallback: "Anunciá con nosotros",
  },
  {
    href: "/suscripcion",
    key: "subscriptions",
    fallback: "Suscripciones",
  },
];

export default function Header({
  onShowLoginModal,
  onShowRegisterModal,
}: HeaderProps) {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileAnchor, setMobileAnchor] = useState<null | HTMLElement>(null);
  const [languageAnchor, setLanguageAnchor] = useState<null | HTMLElement>(null);
  const [accountAnchor, setAccountAnchor] = useState<null | HTMLElement>(null);

  const isAdmin = Boolean(user?.isadmin || user?.isAdmin);
  const canPublish = Boolean(
    user && (user.tipo_usuario === "ofertante" || isAdmin),
  );
  const currentLanguage = i18n.language?.startsWith("en") ? "EN" : "ES";
  const initials = String(user?.nombre || "FP")
    .trim()
    .slice(0, 2)
    .toUpperCase();

  const closeMobileMenu = () => setMobileAnchor(null);
  const closeLanguageMenu = () => setLanguageAnchor(null);
  const closeAccountMenu = () => setAccountAnchor(null);

  const changeLanguage = (language: "es" | "en") => {
    i18n.changeLanguage(language);
    closeLanguageMenu();
    closeMobileMenu();
  };

  const handleLogout = () => {
    logout();
    closeAccountMenu();
    closeMobileMenu();
    router.push("/");
  };

  const handleCreateOffer = () => {
    closeMobileMenu();
    router.push("/create-offer");
  };

  const navButtonSx = (href: string) => {
    const active =
      href === "/" ? pathname === "/" : Boolean(pathname?.startsWith(href));
    return {
      position: "relative",
      minWidth: 0,
      px: { lg: 0.9, xl: 1.25 },
      py: 1,
      borderRadius: 1,
      color: active ? "#fff" : "rgba(255,255,255,.76)",
      fontSize: { lg: ".72rem", xl: ".78rem" },
      fontWeight: 800,
      whiteSpace: "nowrap",
      "&:after": active
        ? {
            content: '""',
            position: "absolute",
            left: 10,
            right: 10,
            bottom: 0,
            height: 2,
            borderRadius: 999,
            bgcolor: "#2f80ff",
          }
        : undefined,
      "&:hover": {
        color: "#fff",
        bgcolor: "rgba(255,255,255,.08)",
      },
    };
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        height: 80,
        justifyContent: "center",
        bgcolor: "#03142e",
        borderBottom: "1px solid rgba(80, 143, 226, .18)",
      }}
    >
      <Toolbar
        disableGutters
        sx={{
          width: "100%",
          maxWidth: 1500,
          minWidth: 0,
          mx: "auto",
          px: { xs: 2, sm: 3, lg: 2.5, xl: 4 },
          display: "flex",
          justifyContent: "space-between",
          gap: 1.5,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", minWidth: 0 }}>
          <Box
            component={Link}
            href="/"
            prefetch={false}
            aria-label="FutbolProyect - Inicio"
            sx={{ display: "flex", alignItems: "center", flexShrink: 0, mr: { lg: 1, xl: 2 } }}
          >
            <Image
              src="/images/logos/logofpblanco.webp"
              alt="FutbolProyect"
              width={105}
              height={60}
              style={{ width: 98, height: "auto", objectFit: "contain" }}
            />
          </Box>

          <Box
            component="nav"
            aria-label="Navegación principal"
            sx={{
              display: { xs: "none", lg: "flex" },
              alignItems: "center",
              minWidth: 0,
              gap: { lg: 0, xl: 0.35 },
            }}
          >
            {navItems.map((item) => (
              <Button
                key={item.href}
                component={Link}
                href={item.href}
                prefetch={false}
                color="inherit"
                sx={navButtonSx(item.href)}
              >
                {t(item.key, item.fallback)}
              </Button>
            ))}
            {isAdmin && (
              <Button
                component={Link}
                href="/admin"
                color="inherit"
                sx={navButtonSx("/admin")}
              >
                Admin
              </Button>
            )}
          </Box>
        </Box>

        <StackDesktop
          currentLanguage={currentLanguage}
          user={user}
          initials={initials}
          canPublish={canPublish}
          onLanguageOpen={setLanguageAnchor}
          onAccountOpen={setAccountAnchor}
          onCreateOffer={handleCreateOffer}
          onLogin={onShowLoginModal}
          onRegister={() => onShowRegisterModal("player")}
          t={t}
        />

        <Box sx={{ display: { xs: "flex", lg: "none" }, alignItems: "center", gap: 0.5 }}>
          <IconButton
            color="inherit"
            aria-label="Cambiar idioma"
            onClick={(event) => setLanguageAnchor(event.currentTarget)}
          >
            <LanguageRoundedIcon />
          </IconButton>
          <IconButton
            color="inherit"
            aria-label="Abrir menú"
            onClick={(event) => setMobileAnchor(event.currentTarget)}
          >
            <MenuRoundedIcon />
          </IconButton>
        </Box>
      </Toolbar>

      <Menu
        anchorEl={languageAnchor}
        open={Boolean(languageAnchor)}
        onClose={closeLanguageMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem selected={currentLanguage === "ES"} onClick={() => changeLanguage("es")}>
          Español
        </MenuItem>
        <MenuItem selected={currentLanguage === "EN"} onClick={() => changeLanguage("en")}>
          English
        </MenuItem>
      </Menu>

      <Menu
        anchorEl={accountAnchor}
        open={Boolean(accountAnchor)}
        onClose={closeAccountMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{ sx: { mt: 1, minWidth: 220, borderRadius: 2 } }}
      >
        <Box sx={{ px: 2, py: 1.3 }}>
          <Typography variant="caption" sx={{ color: "#758196" }}>
            Sesión iniciada como
          </Typography>
          <Typography sx={{ color: "#0a1930", fontWeight: 900 }} noWrap>
            {user?.nombre || "FutbolProyect"}
          </Typography>
        </Box>
        <Divider />
        <MenuItem component={Link} href="/profile" onClick={closeAccountMenu}>
          <PersonOutlineRoundedIcon fontSize="small" sx={{ mr: 1.2 }} />
          {t("my_profile", "Mi perfil")}
        </MenuItem>
        {isAdmin && (
          <MenuItem component={Link} href="/admin" onClick={closeAccountMenu}>
            <AdminPanelSettingsOutlinedIcon fontSize="small" sx={{ mr: 1.2 }} />
            Administración
          </MenuItem>
        )}
        <Divider />
        <MenuItem onClick={handleLogout} sx={{ color: "#c62828" }}>
          <LogoutRoundedIcon fontSize="small" sx={{ mr: 1.2 }} />
          {t("logout", "Cerrar sesión")}
        </MenuItem>
      </Menu>

      <Menu
        anchorEl={mobileAnchor}
        open={Boolean(mobileAnchor)}
        onClose={closeMobileMenu}
        keepMounted
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{ sx: { mt: 1, minWidth: 240, maxHeight: "calc(100vh - 96px)" } }}
      >
        {navItems.map((item) => (
          <MenuItem
            key={item.href}
            component={Link}
            href={item.href}
            prefetch={false}
            onClick={closeMobileMenu}
          >
            {t(item.key, item.fallback)}
          </MenuItem>
        ))}
        {isAdmin && (
          <MenuItem component={Link} href="/admin" onClick={closeMobileMenu}>
            Admin
          </MenuItem>
        )}
        <Divider />
        {user ? (
          <>
            {canPublish && (
              <MenuItem onClick={handleCreateOffer}>
                {t("publish_offer", "Publicar oferta")}
              </MenuItem>
            )}
            <MenuItem component={Link} href="/profile" onClick={closeMobileMenu}>
              {t("my_profile", "Mi perfil")}
            </MenuItem>
            <MenuItem onClick={handleLogout} sx={{ color: "#c62828" }}>
              {t("logout", "Cerrar sesión")}
            </MenuItem>
          </>
        ) : (
          <>
            <MenuItem
              onClick={() => {
                closeMobileMenu();
                onShowLoginModal();
              }}
            >
              {t("login", "Iniciar sesión")}
            </MenuItem>
            <MenuItem
              onClick={() => {
                closeMobileMenu();
                onShowRegisterModal("player");
              }}
            >
              {t("register", "Registrarse")}
            </MenuItem>
          </>
        )}
      </Menu>
    </AppBar>
  );
}

type StackDesktopProps = {
  currentLanguage: string;
  user: any;
  initials: string;
  canPublish: boolean;
  onLanguageOpen: (element: HTMLElement) => void;
  onAccountOpen: (element: HTMLElement) => void;
  onCreateOffer: () => void;
  onLogin: () => void;
  onRegister: () => void;
  t: any;
};

function StackDesktop({
  currentLanguage,
  user,
  initials,
  canPublish,
  onLanguageOpen,
  onAccountOpen,
  onCreateOffer,
  onLogin,
  onRegister,
  t,
}: StackDesktopProps) {
  return (
    <Box
      sx={{
        display: { xs: "none", lg: "flex" },
        alignItems: "center",
        justifyContent: "flex-end",
        flexShrink: 0,
        gap: { lg: 0.6, xl: 1 },
      }}
    >
      <Button
        color="inherit"
        startIcon={<LanguageRoundedIcon />}
        endIcon={<KeyboardArrowDownRoundedIcon />}
        onClick={(event) => onLanguageOpen(event.currentTarget)}
        sx={{
          minWidth: 0,
          px: 1,
          color: "rgba(255,255,255,.78)",
          fontSize: ".76rem",
          fontWeight: 800,
        }}
      >
        {currentLanguage}
      </Button>

      {user ? (
        <>
          {canPublish && (
            <Button
              variant="contained"
              onClick={onCreateOffer}
              sx={{
                px: { lg: 1.4, xl: 2 },
                py: 1,
                bgcolor: "#1262db",
                fontSize: { lg: ".72rem", xl: ".78rem" },
                fontWeight: 900,
                whiteSpace: "nowrap",
                "&:hover": { bgcolor: "#0d4faf" },
              }}
            >
              {t("publish_offer", "Publicar oferta")}
            </Button>
          )}
          <Button
            color="inherit"
            onClick={(event) => onAccountOpen(event.currentTarget)}
            endIcon={<KeyboardArrowDownRoundedIcon />}
            aria-label="Abrir menú de cuenta"
            sx={{
              minWidth: 0,
              pl: 0.5,
              pr: 0.8,
              color: "#fff",
              borderRadius: 99,
              "&:hover": { bgcolor: "rgba(255,255,255,.08)" },
            }}
          >
            <Avatar
              sx={{
                width: 34,
                height: 34,
                mr: { lg: 0, xl: 0.7 },
                bgcolor: "rgba(18,98,219,.22)",
                border: "1px solid rgba(98,168,255,.35)",
                color: "#9bc7ff",
                fontSize: ".78rem",
                fontWeight: 900,
              }}
            >
              {initials}
            </Avatar>
            <Typography
              variant="caption"
              sx={{
                display: { lg: "none", xl: "block" },
                maxWidth: 110,
                color: "#fff",
                fontWeight: 800,
              }}
              noWrap
            >
              {user.nombre || "Mi cuenta"}
            </Typography>
          </Button>
        </>
      ) : (
        <>
          <Button
            color="inherit"
            onClick={onLogin}
            sx={{ px: 1, fontSize: ".76rem", fontWeight: 800, whiteSpace: "nowrap" }}
          >
            {t("login", "Iniciar sesión")}
          </Button>
          <Button
            variant="contained"
            onClick={onRegister}
            sx={{
              bgcolor: "#1262db",
              fontSize: ".76rem",
              fontWeight: 900,
              whiteSpace: "nowrap",
              "&:hover": { bgcolor: "#0d4faf" },
            }}
          >
            {t("register", "Registrarse")}
          </Button>
        </>
      )}
    </Box>
  );
}
