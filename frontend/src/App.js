import React, { useState, Suspense, lazy, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import Toolbar from "@mui/material/Toolbar";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import { useQuery, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import OfferList from "./components/OfferList";
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
import { HelmetProvider } from "react-helmet-async";
import AdminRoute from "./components/AdminRoute";
import PromotionModal from "./components/PromotionModal";

// Lazy load page components
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
const FeaturedProfilesPage = lazy(() => import("./components/FeaturedProfilesPage"));
const FeaturedProfilesCarousel = lazy(() => import("./components/FeaturedProfilesCarousel"));
const About = lazy(() => import("./components/About"));
const Mission = lazy(() => import("./components/Mission"));
const ContactSummary = lazy(() => import("./components/ContactSummary"));
const OfertasTrabajoFutbolPage = lazy(() => import("./components/OfertasTrabajoFutbolPage"));
const AnalistaDatosFutbolPage = lazy(() => import("./components/AnalistaDatosFutbolPage"));
const PerfilesJugadoresFutbolPage = lazy(() => import("./components/PerfilesJugadoresFutbolPage"));

// Create a client
const queryClient = new QueryClient();

const fetchHomePageOffers = async () => {
  const { data } = await apiClient.get("/offers?limit=6");
  // Combine featured and normal offers for the homepage display
  return [...(data.featuredOffers || []), ...(data.offers || [])];
};

function AppContent() {
  const { t } = useTranslation();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showPromotionModal, setShowPromotionModal] = useState(false);
  const [registrationRole, setRegistrationRole] = useState('player');
  const navigate = useNavigate();

  const handleShowRegisterModal = (role) => {
    setRegistrationRole(role);
    setShowRegisterModal(true);
  };

  useEffect(() => {
    const alreadyShown = sessionStorage.getItem('promotionModalShown');
    const currentMonth = new Date().getMonth(); // 0-11 (enero-diciembre)

    if (!alreadyShown && currentMonth === 10) { // 10 es Noviembre
      setShowPromotionModal(true);
      sessionStorage.setItem('promotionModalShown', 'true');
    }
  }, []);

  const { 
    data: homePageOffers = [], 
    isLoading, 
    error 
  } = useQuery({ 
    queryKey: ['homePageOffers'], 
    queryFn: fetchHomePageOffers 
  });

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['homePageOffers'] });
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
        onShowRegisterModal={() => handleShowRegisterModal('player')}
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
                  {isLoading ? (
                    <LoadingSpinner />
                  ) : error ? (
                    <p>{t('error_loading_offers')}</p>
                  ) : (
                    <OfferList
                      offers={homePageOffers}
                      onOfferAction={handleRefresh}
                      isHomePage={true}
                    />
                  )}
                  <div className="view-all-offers-container">
                    <Link to="/offers" className="btn-main">
                      {t("view_all_offers")}
                    </Link>
                  </div>

                  <FeaturedProfilesCarousel />
                  <div className="view-all-profiles-container" style={{textAlign: 'center', padding: '2rem 0'}}>
                    <Link to="/perfiles-destacados" className="btn-main">
                      {t("view_all_profiles", "Ver todos los perfiles")}
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
            {/* Other Routes */}
            <Route path="/offers" element={<AllOffersPage />} />
            <Route path="/offers/:offerId" element={<OfferDetailPage />} />
            <Route path="/profile/:userId" element={<ProfilePage />} />
            <Route path="/perfiles-destacados" element={<FeaturedProfilesPage />} />
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
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/create-offer" element={<CreateOffer />} />
            <Route path="/edit-offer/:offerId" element={<CreateOffer />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/ofertas-trabajo-futbol" element={<OfertasTrabajoFutbolPage />} />
            <Route path="/trabajo-analista-datos-futbol" element={<AnalistaDatosFutbolPage />} />
            <Route path="/perfiles-jugadores-futbol" element={<PerfilesJugadoresFutbolPage />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />

      <PromotionModal 
        isOpen={showPromotionModal} 
        onClose={() => setShowPromotionModal(false)} 
        onShowRegisterModal={handleShowRegisterModal} 
      />

      <Modal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)}>
        <Suspense fallback={<LoadingSpinner />}>
          <Login onClose={() => setShowLoginModal(false)} />
        </Suspense>
      </Modal>

      <Modal isOpen={showRegisterModal} onClose={() => setShowRegisterModal(false)}>
        <Suspense fallback={<LoadingSpinner />}>
          <Register 
            onClose={() => setShowRegisterModal(false)} 
            initialRole={registrationRole} 
          />
        </Suspense>
      </Modal>
    </div>
  );
}

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <Router>
          <AuthProvider>
            <ParallaxProvider>
              <AppContent />
            </ParallaxProvider>
          </AuthProvider>
        </Router>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
