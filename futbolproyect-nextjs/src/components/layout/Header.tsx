'use client';

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import MenuIcon from "@mui/icons-material/Menu";
import LanguageIcon from "@mui/icons-material/Language";
import Box from "@mui/material/Box";
import { useTranslation } from "react-i18next";
// import { useAuth } from "../context/AuthContext"; // AuthContext not yet migrated
import Image from "next/image"; // Using next/image for optimized images

// import { useAuth } from "../context/AuthContext"; // AuthContext not yet migrated

// Mock AuthContext for now - TEMPORARILY DISABLED TO FIX BUILD ERROR
// const useAuth = () => {
//   const user = {
//     id: 1,
//     nombre: "MockUser",
//     isadmin: true,
//     tipo_usuario: "ofertante",
//   };
//   const logout = (navigate: any) => {
//     console.log("Mock logout");
//     navigate("/");
//   };
//   return { user, logout };
// };


function Header({ onShowLoginModal, onShowRegisterModal }: { onShowLoginModal: () => void, onShowRegisterModal: (role: string) => void }) {
  const { t, i18n } = useTranslation();
  const user = null; // Temporarily set user to null to fix build error
  // console.log("User object in Header:", user); // Temporarily commented out
  const router = useRouter(); // Use useRouter from next/navigation
  const pathname = usePathname(); // Get pathname
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [languageAnchorEl, setLanguageAnchorEl] = useState<null | HTMLElement>(null);
  const isMobileMenuOpen = Boolean(anchorEl);
  const isLanguageMenuOpen = Boolean(languageAnchorEl);

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setLanguageAnchorEl(event.currentTarget);
  };

  const handleLanguageMenuClose = () => {
    setLanguageAnchorEl(null);
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    handleMobileMenuClose();
    handleLanguageMenuClose();
    // In Next.js, language changes often involve routing
    router.push(`/${lng}${pathname}`); // Use pathname
  };

  const handleLogout = () => {
    // logout(router); // Temporarily commented out
    handleMobileMenuClose();
  };

  const handleCreateOfferClick = () => {
    router.push("/create-offer");
    handleMobileMenuClose();
  };

  return (
    <AppBar
      position="fixed"
      color="primary"
      sx={{ height: "80px", justifyContent: "center" }}
    >
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          bgcolor: "primary.main",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Link href="/" style={{ textDecoration: "none", color: "inherit" }}>
            <Image
              src="/images/logos/logofpblanco.png" // Path relative to public directory
              alt="FP FutbolProyect"
              width={120} // Adjusted width
              height={70} // Original height
              style={{ marginRight: 16 }}
            />
          </Link>
          <Box sx={{ display: { xs: "none", md: "flex" }, gap: 2 }}>
            <Button color="inherit" component={Link} href="/">
              {t("home")}
            </Button>
            <Button color="inherit" component={Link} href="/offers">
              {t("offers")}
            </Button>
            <Button color="inherit" component={Link} href="/perfiles-destacados">
              {t("featured_profiles", "Perfiles Destacados")}
            </Button>
            <Button color="inherit" component={Link} href="/subscribe">
              {t("subscriptions")}
            </Button>
            {user && user.isadmin && (
              <Button color="inherit" component={Link} href="/admin">
                Admin
              </Button>
            )}
            {/* New SEO pages links */}
            <Button color="inherit" component={Link} href="/ofertas-trabajo-futbol">
              {t("ofertas_trabajo_futbol_seo_title", "Ofertas de Trabajo Fútbol")}
            </Button>
            <Button color="inherit" component={Link} href="/trabajo-analista-datos-futbol">
              {t("trabajo_analista_seo_title", "Trabajo Analista Datos Fútbol")}
            </Button>
            <Button color="inherit" component={Link} href="/perfiles-jugadores-futbol">
              {t("perfiles_jugadores_seo_title", "Perfiles Jugadores Fútbol")}
            </Button>
            <Button color="inherit" component={Link} href="/empleo-entrenadores-futbol">
              {t("empleo_entrenadores_seo_title", "Empleo Entrenadores Fútbol")}
            </Button>
          </Box>
        </Box>
        <Box
          sx={{
            display: { xs: "none", md: "flex" },
            alignItems: "center",
            gap: 2,
          }}
        >
          {user && user.id ? (
            <>
              {(user.tipo_usuario === "ofertante" || user.isadmin) && (
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleCreateOfferClick}
                  sx={{ mr: 1 }}
                >
                  {t("publish_offer")}
                </Button>
              )}
              <Button
                color="inherit"
                component={Link}
                href={`/profile/${user.id}`}
              >
                {t("my_profile")}
              </Button>
              <Typography variant="body2" sx={{ mx: 1 }}>
                | {t("welcome_user", { name: user.nombre })}
              </Typography>
              <Button color="error" variant="outlined" onClick={handleLogout}>
                {t("logout")}
              </Button>
            </>
          ) : user ? (
            <>
              <Typography variant="body2" sx={{ mx: 1 }}>
                {t("welcome_user", { name: user.nombre })}
              </Typography>
              <Button color="error" variant="outlined" onClick={handleLogout}>
                {t("logout")}
              </Button>
            </>
          ) : (
            <>
              <Button color="inherit" onClick={() => changeLanguage("es")}>
                ES
              </Button>
              <Button color="inherit" onClick={() => changeLanguage("en")}>
                EN
              </Button>
              <Button color="inherit" onClick={onShowLoginModal}>
                {t("login")}
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => onShowRegisterModal('player')}
              >
                {t("register")}
              </Button>
            </>
          )}
        </Box>
        <Box sx={{ display: { xs: "flex", md: "none" } }}>
          <IconButton
            color="inherit"
            onClick={handleLanguageMenuOpen}
            sx={{ mr: 1 }}
          >
            <LanguageIcon />
          </IconButton>
          <Menu
            anchorEl={languageAnchorEl}
            open={isLanguageMenuOpen}
            onClose={handleLanguageMenuClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <MenuItem onClick={() => changeLanguage("es")}>ES</MenuItem>
            <MenuItem onClick={() => changeLanguage("en")}>EN</MenuItem>
          </Menu>

          <IconButton color="inherit" onClick={handleMobileMenuOpen}>
            <MenuIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={isMobileMenuOpen}
            onClose={handleMobileMenuClose}
            keepMounted
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <MenuItem component={Link} href="/" onClick={handleMobileMenuClose}>
              {t("home")}
            </MenuItem>
            <MenuItem
              component={Link}
              href="/offers"
              onClick={handleMobileMenuClose}
            >
              {t("offers")}
            </MenuItem>
            <MenuItem
              component={Link}
              href="/perfiles-destacados"
              onClick={handleMobileMenuClose}
            >
              {t("featured_profiles", "Perfiles Destacados")}
            </MenuItem>
            <MenuItem
              component={Link}
              href="/subscribe"
              onClick={handleMobileMenuClose}
            >
              {t("subscriptions")}
            </MenuItem>
            {user && user.isadmin && (
              <MenuItem
                component={Link}
                href="/admin"
                onClick={handleMobileMenuClose}
              >
                Admin
              </MenuItem>
            )}
            {/* New SEO pages links in mobile menu */}
            <MenuItem component={Link} href="/ofertas-trabajo-futbol" onClick={handleMobileMenuClose}>
              {t("ofertas_trabajo_futbol_seo_title", "Ofertas de Trabajo Fútbol")}
            </MenuItem>
            <MenuItem component={Link} href="/trabajo-analista-datos-futbol" onClick={handleMobileMenuClose}>
              {t("trabajo_analista_seo_title", "Trabajo Analista Datos Fútbol")}
            </MenuItem>
            <MenuItem component={Link} href="/perfiles-jugadores-futbol" onClick={handleMobileMenuClose}>
              {t("perfiles_jugadores_seo_title", "Perfiles Jugadores Fútbol")}
            </MenuItem>
            <MenuItem component={Link} href="/empleo-entrenadores-futbol" onClick={handleMobileMenuClose}>
              {t("empleo_entrenadores_seo_title", "Empleo Entrenadores Fútbol")}
            </MenuItem>

            <Box sx={{ my: 1 }} />
            {user && user.id ? (
              <>
                {(user.tipo_usuario === "ofertante" || user.isadmin) && (
                  <MenuItem onClick={handleCreateOfferClick}>
                    {t("publish_offer")}
                  </MenuItem>
                )}
                <MenuItem
                  component={Link}
                  href={`/profile/${user.id}`}
                  onClick={handleMobileMenuClose}
                >
                  {t("my_profile")}
                </MenuItem>
                <MenuItem disabled>
                  | {t("welcome_user", { name: user.nombre })}
                </MenuItem>
                <MenuItem onClick={handleLogout} sx={{ color: "error.main" }}>
                  {t("logout")}
                </MenuItem>
              </>
            ) : user ? (
              <>
                <MenuItem disabled>
                  | {t("welcome_user", { name: user.nombre })}
                </MenuItem>
                <MenuItem onClick={handleLogout} sx={{ color: "error.main" }}>
                  {t("logout")}
                </MenuItem>
              </>
            ) : (
              <>
                <MenuItem
                  onClick={() => {
                    onShowLoginModal();
                    handleMobileMenuClose();
                  }}
                >
                  {t("login")}
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    onShowRegisterModal('player');
                    handleMobileMenuClose();
                  }}
                >
                  {t("register")}
                </MenuItem>
              </>
            )}
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
