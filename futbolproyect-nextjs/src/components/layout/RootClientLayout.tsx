"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import Header from "./Header";
import Footer from "./Footer";
import { Dialog, Modal, Box } from "@mui/material";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = dynamic(() => import("@/components/auth/Login"), { ssr: false });
const Register = dynamic(() => import("@/components/auth/Register"), {
  ssr: false,
});
const CreateOffer = dynamic(() => import("@/components/CreateOffer"), {
  ssr: false,
});

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
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <Header
        onShowLoginModal={handleShowLogin}
        onShowRegisterModal={handleShowRegister}
        onShowCreateOfferModal={handleShowCreateOffer}
      />

      <main className="min-h-screen" style={{ paddingTop: '80px' }}>{children}</main>

      <Footer />

      {/* --- MODALES --- */}

      {isLoginOpen && (
        <Dialog
          open={isLoginOpen}
          onClose={handleCloseLogin}
          fullWidth
          maxWidth="xs"
          PaperProps={{ sx: { position: "relative", borderRadius: { xs: 0, sm: 3 }, m: { xs: 0, sm: 2 }, maxHeight: { xs: "100dvh", sm: "calc(100% - 64px)" } } }}
          sx={{ "& .MuiDialog-container": { alignItems: { xs: "stretch", sm: "center" } } }}
        >
          <Login
            onClose={handleCloseLogin}
            onSwitchToRegister={() => {
              handleCloseLogin();
              handleShowRegister("player");
            }}
          />
        </Dialog>
      )}

      {isRegisterOpen && (
        <Dialog
          open={isRegisterOpen}
          onClose={handleCloseRegister}
          fullWidth
          maxWidth="sm"
          PaperProps={{ sx: { position: "relative", borderRadius: { xs: 0, sm: 3 }, m: { xs: 0, sm: 2 }, maxHeight: { xs: "100dvh", sm: "calc(100% - 64px)" } } }}
          sx={{ "& .MuiDialog-container": { alignItems: { xs: "stretch", sm: "center" } } }}
        >
          <Register
            onClose={handleCloseRegister}
            initialRole={registerRole}
            onSwitchToLogin={() => {
              handleCloseRegister();
              handleShowLogin();
            }}
          />
        </Dialog>
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
