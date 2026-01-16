"use client";

import React, { useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import Login from "@/components/auth/Login";
import Register from "@/components/auth/Register";
import CreateOffer from "@/components/CreateOffer";
import { Modal } from "@mui/material"; // O tu componente Modal personalizado si usas uno diferente
import { Box } from "@mui/material";

interface RootClientLayoutProps {
  children: React.ReactNode;
}

export default function RootClientLayout({ children }: RootClientLayoutProps) {
  // Estados para controlar los modales
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isCreateOfferOpen, setIsCreateOfferOpen] = useState(false);
  const [registerRole, setRegisterRole] = useState<'player' | 'club'>("player"); // Rol por defecto para registro

  // Handlers
  const handleShowLogin = () => setIsLoginOpen(true);
  const handleCloseLogin = () => setIsLoginOpen(false);

  const handleShowRegister = (role: 'player' | 'club' = "player") => {
    setRegisterRole(role);
    setIsRegisterOpen(true);
  };
  const handleCloseRegister = () => setIsRegisterOpen(false);

  const handleShowCreateOffer = () => setIsCreateOfferOpen(true);
  const handleCloseCreateOffer = () => setIsCreateOfferOpen(false);

  return (
    <>
      {/* Pasamos las funciones al Header para que los botones funcionen */}
      <Header
        onShowLoginModal={handleShowLogin}
        onShowRegisterModal={handleShowRegister}
        onShowCreateOfferModal={handleShowCreateOffer}
      />

      <main className="min-h-screen">{children}</main>

      <Footer />

      {/* --- MODALES --- */}

      {/* Modal de Login */}
      {isLoginOpen && (
        <Modal open={isLoginOpen} onClose={handleCloseLogin}>
          <Box sx={{ outline: "none" }}>
            {/* Login ya tiene su propio Card/Estilos, solo lo renderizamos */}
            <Login onClose={handleCloseLogin} />
          </Box>
        </Modal>
      )}

      {/* Modal de Registro */}
      {isRegisterOpen && (
        <Modal open={isRegisterOpen} onClose={handleCloseRegister}>
          <Box sx={{ outline: "none" }}>
            <Register
              onClose={handleCloseRegister}
              initialRole={registerRole} // Pasamos el rol seleccionado
              onSwitchToLogin={() => {
                handleCloseRegister();
                handleShowLogin();
              }}
            />
          </Box>
        </Modal>
      )}

      {/* Modal de Crear Oferta */}
      {isCreateOfferOpen && (
        <Modal open={isCreateOfferOpen} onClose={handleCloseCreateOffer}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: { xs: "90%", sm: 600 },
              bgcolor: "background.paper",
              boxShadow: 24,
              p: 4,
              borderRadius: 2,
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <CreateOffer onClose={handleCloseCreateOffer} />
          </Box>
        </Modal>
      )}
    </>
  );
}
