import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import MenuIcon from "@mui/icons-material/Menu";
import LanguageIcon from "@mui/icons-material/Language"; // Importar el icono de idioma
import Box from "@mui/material/Box";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import OptimizedImage from "./OptimizedImage";

function Header({ onShowLoginModal, onShowRegisterModal }) {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  console.log("User object in Header:", user); // Debugging line
  const navigate = useNavigate(); // Get navigate function
  const [anchorEl, setAnchorEl] = useState(null);
  const [languageAnchorEl, setLanguageAnchorEl] = useState(null); // Nuevo estado para el menú de idioma
  const isMobileMenuOpen = Boolean(anchorEl);
  const isLanguageMenuOpen = Boolean(languageAnchorEl); // Nuevo estado para el menú de idioma

  const handleMobileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageMenuOpen = (event) => {
    // Nueva función para abrir el menú de idioma
    setLanguageAnchorEl(event.currentTarget);
  };

  const handleLanguageMenuClose = () => {
    // Nueva función para cerrar el menú de idioma
    setLanguageAnchorEl(null);
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    handleMobileMenuClose();
    handleLanguageMenuClose(); // Cerrar también el menú de idioma
  };

  const handleLogout = () => {
    logout(navigate); // Pass navigate to logout
    handleMobileMenuClose();
  };

  const handleCreateOfferClick = () => {
    navigate("/create-offer");
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
          <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
            <OptimizedImage
              src="/images/logos/logofpblanco.png"
              alt="FP FutbolProyect"
              style={{ height: "100%", maxHeight: "70px", marginRight: 16 }}
            />
          </Link>
          <Box sx={{ display: { xs: "none", md: "flex" }, gap: 2 }}>
            <Button color="inherit" component={Link} to="/">
              {t("home")}
            </Button>
            <Button color="inherit" component={Link} to="/offers">
              {t("offers")}
            </Button>
            <Button color="inherit" component={Link} to="/subscribe">
              {t("subscriptions")}
            </Button>
            {user && user.isadmin && (
              <Button color="inherit" component={Link} to="/admin">
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
                to={`/profile/${user.id}`}
              >
                {t("my_profile")}
              </Button>
              <Typography variant="body2" sx={{ mx: 1 }}>
                | {t("welcome_user", { name: user.name })}
              </Typography>
              <Button color="error" variant="outlined" onClick={handleLogout}>
                {t("logout")}
              </Button>
            </>
          ) : user ? (
            // Render a limited view if user exists but id doesn't (during login process)
            <>
              <Typography variant="body2" sx={{ mx: 1 }}>
                {t("welcome_user", { name: user.name })}
              </Typography>
              <Button color="error" variant="outlined" onClick={handleLogout}>
                {t("logout")}
              </Button>
            </>
          ) : (
            // Render login/register buttons if no user
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
                onClick={onShowRegisterModal}
              >
                {t("register")}
              </Button>
            </>
          )}
        </Box>
        <Box sx={{ display: { xs: "flex", md: "none" } }}>
          {/* Nuevo menú desplegable de idioma para móvil */}
          <IconButton
            color="inherit"
            onClick={handleLanguageMenuOpen}
            sx={{ mr: 1 }} // Margen a la derecha para separar del menú de hamburguesa
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
            <MenuItem component={Link} to="/" onClick={handleMobileMenuClose}>
              {t("home")}
            </MenuItem>
            <MenuItem
              component={Link}
              to="/offers"
              onClick={handleMobileMenuClose}
            >
              {t("offers")}
            </MenuItem>
            <MenuItem
              component={Link}
              to="/subscribe"
              onClick={handleMobileMenuClose}
            >
              {t("subscriptions")}
            </MenuItem>
            {user && user.isadmin && (
              <MenuItem
                component={Link}
                to="/admin"
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
                  to={`/profile/${user.id}`}
                  onClick={handleMobileMenuClose}
                >
                  {t("my_profile")}
                </MenuItem>
                <MenuItem disabled>
                  | {t("welcome_user", { name: user.name })}
                </MenuItem>
                <MenuItem onClick={handleLogout} sx={{ color: "error.main" }}>
                  {t("logout")}
                </MenuItem>
              </>
            ) : user ? (
              <>
                <MenuItem disabled>
                  | {t("welcome_user", { name: user.name })}
                </MenuItem>
                <MenuItem onClick={handleLogout} sx={{ color: "error.main" }}>
                  {t("logout")}
                </MenuItem>
              </>
            ) : (
              <>
                {/* Eliminar los botones de idioma de aquí */}
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
                    onShowRegisterModal();
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
