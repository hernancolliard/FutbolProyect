'use client';

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

import { useAuth } from "@/context/AuthContext"; // Import AuthContext

function Header({ onShowLoginModal, onShowRegisterModal, onShowCreateOfferModal }: { onShowLoginModal: () => void, onShowRegisterModal: (role: string) => void, onShowCreateOfferModal: () => void }) {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth(); // Use AuthContext
  const router = useRouter(); // Use useRouter from next/navigation
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [languageAnchorEl, setLanguageAnchorEl] = useState<null | HTMLElement>(null);
  const isMobileMenuOpen = Boolean(anchorEl);
  const isLanguageMenuOpen = Boolean(languageAnchorEl);
  const headerButtonSx = {
    borderRadius: 1,
    px: 1.5,
    transition: "background-color 180ms ease, color 180ms ease",
    "&:hover": {
      bgcolor: "rgba(255, 255, 255, 0.16)",
      color: "#ffffff",
    },
  };
  const headerOutlinedButtonSx = {
    transition: "background-color 180ms ease, border-color 180ms ease",
    "&:hover": {
      bgcolor: "rgba(244, 67, 54, 0.12)",
      borderColor: "error.light",
    },
  };
  const headerContainedButtonSx = {
    transition: "background-color 180ms ease, filter 180ms ease",
    "&:hover": {
      filter: "brightness(1.08)",
    },
  };

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
  };

  const handleLogout = () => {
    logout(); // Temporarily commented out
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
            <Button color="inherit" component={Link} href="/" sx={headerButtonSx}>
              {t("home")}
            </Button>
                            <Button color="inherit" component={Link} href="/all-offers" sx={headerButtonSx}>
                              {t("offers")}
                            </Button>            <Button color="inherit" component={Link} href="/perfiles" sx={headerButtonSx}>
              {t("all_profiles", "Todos los Perfiles")}
            </Button>
                                        <Button color="inherit" component={Link} href="/publicidad" sx={headerButtonSx}>
                                          {t("advertise_with_us", "Anuncia con nosotros")}
                                        </Button>
                                        <Button color="inherit" component={Link} href="/suscripcion" sx={headerButtonSx}>
                                          {t("subscriptions")}
                                        </Button>
                                        {user && user.isadmin && (
                                          <Button color="inherit" component={Link} href="/admin" sx={headerButtonSx}>
                                            Admin
                                          </Button>
                                        )}
                                      </Box>
                                    </Box>
        <Box
          sx={{
            display: { xs: "none", md: "flex" },
            alignItems: "center",
            gap: 2,
          }}
        >
          <Button color="inherit" onClick={() => changeLanguage("es")} sx={headerButtonSx}>
            ES
          </Button>
          <Button color="inherit" onClick={() => changeLanguage("en")} sx={headerButtonSx}>
            EN
          </Button>
          {user && user.id ? (
            <>
              {(user.tipo_usuario === "ofertante" || user.isadmin) && (
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleCreateOfferClick}
                  sx={{ mr: 1, ...headerContainedButtonSx }}
                >
                  {t("publish_offer")}
                </Button>
              )}
              <Button
                color="inherit"
                component={Link}
                href="/profile"
                sx={headerButtonSx}
              >
                {t("my_profile")}
              </Button>
              <Typography variant="body2" sx={{ mx: 1 }}>
                | {t("welcome_user", { name: user.nombre })}
              </Typography>
              <Button color="error" variant="outlined" onClick={handleLogout} sx={headerOutlinedButtonSx}>
                {t("logout")}
              </Button>
            </>
          ) : user ? (
            <>
              <Typography variant="body2" sx={{ mx: 1 }}>
                {t("welcome_user", { name: user.nombre })}
              </Typography>
              <Button color="error" variant="outlined" onClick={handleLogout} sx={headerOutlinedButtonSx}>
                {t("logout")}
              </Button>
            </>
          ) : (
            <>
              <Button color="inherit" onClick={onShowLoginModal} sx={headerButtonSx}>
                {t("login")}
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => onShowRegisterModal('player')}
                sx={headerContainedButtonSx}
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
            sx={{ mr: 1, ...headerButtonSx }}
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

          <IconButton color="inherit" onClick={handleMobileMenuOpen} sx={headerButtonSx}>
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
              href="/all-offers"
              onClick={handleMobileMenuClose}
            >
              {t("offers")}
            </MenuItem>
            <MenuItem
              component={Link}
              href="/perfiles"
              onClick={handleMobileMenuClose}
            >
              {t("all_profiles", "Todos los Perfiles")}
            </MenuItem>
            <MenuItem
              component={Link}
              href="/publicidad"
              onClick={handleMobileMenuClose}
            >
              {t("advertise_with_us", "Anuncia con nosotros")}
            </MenuItem>
            <MenuItem
              component={Link}
              href="/suscripcion"
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
                  href="/profile"
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
