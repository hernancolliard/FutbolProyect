'use client';

import React, { useState } from "react";
import UserManagement from "./UserManagement";
import OfferManagement from "./OfferManagement";
import SubscriptionManagement from "./SubscriptionManagement";
import ContactMessages from "./ContactMessages";
import ClubContacts from "./ClubContacts";
import AdvertisementManagement from "./AdvertisementManagement";
import AdvertisingLeadManagement from "./AdvertisingLeadManagement";
import AffiliateManagement from "./AffiliateManagement";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { useTranslation } from "react-i18next";

function AdminDashboard() {
  const { t } = useTranslation('common');
  const [activeTab, setActiveTab] = useState("users");

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box className="admin-dashboard" sx={{ mt: 4, width: '100%' }}>
      <Typography variant="h4" sx={{ mb: 2, fontSize: { xs: '1.5rem', md: '2rem' } }}>
        {t('admin_dashboard_title', 'Panel de Administración')}
      </Typography>
      <Box sx={{ width: '100%', overflowX: 'auto' }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label={t('admin_tabs')}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
        <Tab label={t('user_management_tab', 'Gestión de Usuarios')} value="users" />
        <Tab label={t('offer_management_tab', 'Gestión de Ofertas')} value="offers" />
        <Tab label={t('subscription_management_tab', 'Gestión de Suscripciones')} value="subscriptions" />
        <Tab label={t('advertising_management_tab', 'Publicidad')} value="advertising" />
        <Tab label={t('advertising_leads_tab', 'Consultas publicidad')} value="advertising-leads" />
        <Tab label={t('affiliates')} value="affiliates" />
        <Tab label={t('contact_messages_tab', 'Mensajes de Contacto')} value="contact" />
        <Tab label={t('club_contacts_tab', 'Contactos Clubes')} value="club-contacts" sx={{ minWidth: 120 }} />
      </Tabs>
      </Box>
      <Box className="admin-content" sx={{ mt: 3, width: '100%' }}>
        {activeTab === "users" && <UserManagement />}
        {activeTab === "offers" && <OfferManagement />}
        {activeTab === "subscriptions" && <SubscriptionManagement />}
        {activeTab === "advertising" && <AdvertisementManagement />}
        {activeTab === "advertising-leads" && <AdvertisingLeadManagement />}
        {activeTab === "affiliates" && <AffiliateManagement />}
        {activeTab === "contact" && <ContactMessages />}
        {activeTab === "club-contacts" && <ClubContacts />}
      </Box>
    </Box>
  );
}

export default AdminDashboard;
