import React, { useState } from "react";
import UserManagement from "./UserManagement";
import OfferManagement from "./OfferManagement";
import SubscriptionManagement from "./SubscriptionManagement";
import ContactMessages from "./ContactMessages";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { useTranslation } from "react-i18next";

function AdminDashboard() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("users");

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box className="admin-dashboard" sx={{ mt: 4 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        {t('admin_dashboard_title')}
      </Typography>
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        aria-label="admin tabs"
      >
        <Tab label={t('user_management_tab')} value="users" />
        <Tab label={t('offer_management_tab')} value="offers" />
        <Tab label={t('subscription_management_tab')} value="subscriptions" />
        <Tab label={t('contact_messages_tab', 'Mensajes')} value="contact" />
      </Tabs>
      <Box className="admin-content" sx={{ mt: 3 }}>
        {activeTab === "users" && <UserManagement />}
        {activeTab === "offers" && <OfferManagement />}
        {activeTab === "subscriptions" && <SubscriptionManagement />}
        {activeTab === "contact" && <ContactMessages />}
      </Box>
    </Box>
  );
}

export default AdminDashboard;
