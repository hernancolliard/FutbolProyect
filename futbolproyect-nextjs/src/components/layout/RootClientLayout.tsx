'use client';

import React, { useState } from 'react';
import { SessionProvider } from 'next-auth/react';
import Header from '@/components/layout/Header';
import Modal from '../ui/Modal';
import Login from '../auth/Login';
import Register from '../auth/Register';
import { Box, Toolbar } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import ReactQueryProvider from '../providers/ReactQueryProvider'; // Import ReactQueryProvider
import { ParallaxProvider } from 'react-scroll-parallax'; // Import ParallaxProvider

import I18nProvider from '../I18nProvider';

export default function RootClientLayout({ children }: { children: React.ReactNode }) {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registrationRole, setRegistrationRole] = useState('player');

  const handleShowRegisterModal = (role: string) => {
    setRegistrationRole(role);
    setShowRegisterModal(true);
  };

  return (
    <>
      <I18nProvider>
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
          onShowCreateOfferModal={() => {
            /* Implement navigation to create offer page */
          }}
        />
        <Toolbar />
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <ReactQueryProvider>
            <ParallaxProvider>{children}</ParallaxProvider>
          </ReactQueryProvider>
        </Box>

        {/* Login Modal */}
        <Modal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)}>
          <Login onClose={() => setShowLoginModal(false)} />
        </Modal>

        {/* Register Modal */}
        <Modal
          isOpen={showRegisterModal}
          onClose={() => setShowRegisterModal(false)}
        >
          <Register
            onClose={() => setShowRegisterModal(false)}
            initialRole={registrationRole}
          />
        </Modal>
      </I18nProvider>
    </>
  );
}