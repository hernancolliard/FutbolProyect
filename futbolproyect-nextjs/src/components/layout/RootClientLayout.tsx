'use client';

import React, { useState } from 'react';
import { SessionProvider } from 'next-auth/react'; // Ensure this is imported if not already in layout
import Header from './Header'; // Import the migrated Header
import Modal from '../ui/Modal'; // Import the migrated Modal
import Login from '../auth/Login'; // Import the migrated Login
import Register from '../auth/Register'; // Import the migrated Register
import { Box, Toolbar } from '@mui/material'; // For layout components
import { ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";

export default function RootClientLayout({ children }: { children: React.ReactNode }) {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registrationRole, setRegistrationRole] = useState('player'); // For Register modal

  const handleShowRegisterModal = (role: string) => {
    setRegistrationRole(role);
    setShowRegisterModal(true);
  };

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
      />
      <Header
        onShowLoginModal={() => setShowLoginModal(true)}
        onShowRegisterModal={handleShowRegisterModal}
        onShowCreateOfferModal={() => { /* Implement navigation to create offer page */ }}
      />
      <Toolbar /> {/* Spacer for the fixed AppBar */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        {children}
      </Box>

      {/* Login Modal */}
      <Modal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)}>
        <Login onClose={() => setShowLoginModal(false)} />
      </Modal>

      {/* Register Modal */}
      <Modal isOpen={showRegisterModal} onClose={() => setShowRegisterModal(false)}>
        <Register onClose={() => setShowRegisterModal(false)} initialRole={registrationRole} />
      </Modal>
    </>
  );
}