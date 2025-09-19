import React, { useState, useEffect, Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import Toolbar from "@mui/material/Toolbar";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import OfferList from "./components/OfferList";
import About from "./components/About";
import Mission from "./components/Mission";
import ContactSummary from "./components/ContactSummary";
import Footer from "./components/Footer";
import TrustedBy from "./components/TrustedBy";
import FadeInOnScroll from "./components/FadeInOnScroll";
import Modal from "./components/Modal";
import Hero from "./components/Hero";
import { useTranslation } from "react-i18next";
import apiClient from "./services/api";
import { AuthProvider } from "./context/AuthContext";
import Header from "./components/Header";
import LoadingSpinner from "./components/LoadingSpinner";
import { ParallaxProvider } from "react-scroll-parallax";

const AdminDashboard = lazy(() => import("./components/AdminDashboard"));
const AllOffersPage = lazy(() => import("./components/AllOffersPage"));
const ApplicantsPage = lazy(() => import("./components/ApplicantsPage"));
const ContactPage = lazy(() => import("./components/ContactPage"));
const CreateOffer = lazy(() => import("./components/CreateOffer"));
const ForgotPasswordPage = lazy(() => import("./components/ForgotPasswordPage"));
const Login = lazy(() => import("./components/Login"));
const OfferDetailPage = lazy(() => import("./components/OfferDetailPage"));
const PagoCanceladoMP = lazy(() => import("./components/PagoCanceladoMP"));
const PagoCanceladoPayPal = lazy(() => import("./components/PagoCanceladoPayPal"));
const PagoExitosoMP = lazy(() => import("./components/PagoExitosoMP"));
const PagoExitosoPayPal = lazy(() => import("./components/PagoExitosoPayPal"));
const PagoPendienteMP = lazy(() => import("./components/PagoPendienteMP"));
const ProfilePage = lazy(() => import("./components/ProfilePage"));
const Register = lazy(() => import("./components/Register"));
const ResetPasswordPage = lazy(() => import("./components/ResetPasswordPage"));
const SubscriptionPage = lazy(() => import("./components/SubscriptionPage"));
const TermsOfService = lazy(() => import("./components/TermsOfService"));
const PrivacyPolicy = lazy(() => import("./components/PrivacyPolicy"));

function AppContent() {
  const { t } = useTranslation();
  const [homePageOffers, setHomePageOffers] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHomePageOffers = async () => {
      try {
        const response = await apiClient.get("/offers?limit=6");
        const { featuredOffers = [], offers = [] } = response.data;
        setHomePageOffers([...featuredOffers, ...offers]);
      } catch (error) {
        console.error("Error fetching home page offers:", error);
      }
    };

    fetchHomePageOffers();
  }, [refreshKey]);

  const refreshData = () => {
    setRefreshKey((prevKey) => prevKey + 1);
  };

  return (
    <div className="App">
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
        onShowRegisterModal={() => setShowRegisterModal(true)}
        onShowCreateOfferModal={() => navigate('/create-offer')}
      />
      <Toolbar />
      <main>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <FadeInOnScroll>
                    <TrustedBy />
                  </FadeInOnScroll>
                  <Hero />
                  <OfferList
                    offers={homePageOffers}
                    onOfferAction={refreshData}
                    isHomePage={true}
                  />
                  <div className="view-all-offers-container">
                    <Link to="/offers" className="btn-main">
                      {t("view_all_offers")}
                    </Link>
                  </div>
                  <hr />
                  <div className="info-sections-container">
                    <About />
                    <FadeInOnScroll>
                      <Mission />
                    </FadeInOnScroll>
                  </div>
                  <hr />
                  <FadeInOnScroll>
                    <ContactSummary />
                  </FadeInOnScroll>
                </>
              }
            />
            <Route path="/offers" element={<AllOffersPage />} />
            <Route path="/offers/:offerId" element={<OfferDetailPage />} />
            <Route path="/profile/:userId" element={<ProfilePage />} />
            <Route path="/offers/:offerId/applicants" element={<ApplicantsPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/subscribe" element={<SubscriptionPage />} />
            <Route path="/pago-exitoso-mp" element={<PagoExitosoMP />} />
            <Route path="/pago-cancelado-mp" element={<PagoCanceladoMP />} />
            <Route path="/pago-pendiente-mp" element={<PagoPendienteMP />} />
            <Route path="/pago-exitoso-paypal" element={<PagoExitosoPayPal />} />
            <Route path="/pago-cancelado-paypal" element={<PagoCanceladoPayPal />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/create-offer" element={<CreateOffer />} />
            <Route path="/edit-offer/:offerId" element={<CreateOffer />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />

      <Modal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)}>
        <Suspense fallback={<LoadingSpinner />}>
          <Login onClose={() => setShowLoginModal(false)} />
        </Suspense>
      </Modal>

      <Modal isOpen={showRegisterModal} onClose={() => setShowRegisterModal(false)}>
        <Suspense fallback={<LoadingSpinner />}>
          <Register onClose={() => setShowRegisterModal(false)} />
        </Suspense>
      </Modal>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ParallaxProvider>
          <AppContent />
        </ParallaxProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;