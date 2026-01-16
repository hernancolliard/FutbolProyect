"use client";

import React, { useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import Login from "@/components/auth/Login";
import Register from "@/components/auth/Register";
import CreateOffer from "@/components/CreateOffer";
import { Modal, Box } from "@mui/material";

interface RootClientLayoutProps {
  children: React.ReactNode;
}

// Definimos un tipo para los roles permitidos en el registro
type RegisterRole = "player" | "club" | "scout" | "agent" | "user";

export default function RootClientLayout({ children }: RootClientLayoutProps) {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isCreateOfferOpen, setIsCreateOfferOpen] = useState(false);

  const [registerRole, setRegisterRole] = useState<RegisterRole>("user");

  const handleShowLogin = () => setIsLoginOpen(true);
  const handleCloseLogin = () => setIsLoginOpen(false);

  const handleShowRegister = (role: string = "user") => {
    if (["player", "club", "scout", "agent"].includes(role)) {
      setRegisterRole(role as RegisterRole);
    } else {
      setRegisterRole("user");
    }
    setIsRegisterOpen(true);
  };

  const handleCloseRegister = () => setIsRegisterOpen(false);

  const handleShowCreateOffer = () => setIsCreateOfferOpen(true);
  const handleCloseCreateOffer = () => setIsCreateOfferOpen(false);

  return (
    <>
      <Header
        onShowLoginModal={handleShowLogin}
        onShowRegisterModal={handleShowRegister}
        onShowCreateOfferModal={handleShowCreateOffer}
      />

      <main className="min-h-screen">{children}</main>

      <Footer />

      {/* --- MODALES --- */}

      {isLoginOpen && (
        <Modal open={isLoginOpen} onClose={handleCloseLogin}>
          <Box sx={{ outline: "none" }}>
            <Login onClose={handleCloseLogin} />
          </Box>
        </Modal>
      )}

      {isRegisterOpen && (
        <Modal open={isRegisterOpen} onClose={handleCloseRegister}>
          <Box sx={{ outline: "none" }}>
            <Register
              onClose={handleCloseRegister}
              initialRole={registerRole}
              onSwitchToLogin={() => {
                handleCloseRegister();
                handleShowLogin();
              }}
            />
          </Box>
        </Modal>
      )}

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
            {/* CORRECCIÓN: Agregamos onOfferCreated */}
            <CreateOffer
              onClose={handleCloseCreateOffer}
              onOfferCreated={handleCloseCreateOffer}
            />
          </Box>
        </Modal>
      )}
    </>
  );
}
