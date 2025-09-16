import React, { useState } from "react";
import SubscribeButton from "./SubscribeButton";
import { useTranslation } from "react-i18next";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

function SubscriptionPage() {
  const { t } = useTranslation();
  const [billingCycle, setBillingCycle] = useState('monthly');

  const handleBillingCycleChange = (event, newBillingCycle) => {
    if (newBillingCycle !== null) {
      setBillingCycle(newBillingCycle);
    }
  };

  return (
    <Stack
      className="subscription-container"
      spacing={4}
      sx={{ mt: 5, alignItems: "center" }}
    >
      <Typography variant="h4">{t("subscription_plans_title")}</Typography>
      <Typography>{t("subscription_plans_subtitle")}</Typography>
      
      <ToggleButtonGroup
        color="primary"
        value={billingCycle}
        exclusive
        onChange={handleBillingCycleChange}
        aria-label="Billing Cycle"
      >
        <ToggleButton value="monthly">{t('monthly')}</ToggleButton>
        <ToggleButton value="annual">{t('annual')}</ToggleButton>
      </ToggleButtonGroup>

      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={4}
        className="plans"
      >
        <Card className="plan" sx={{ minWidth: 300 }}>
          <CardContent>
            <Typography variant="h6">{t("offerer_plan_title")}</Typography>
            <Typography>{t("offerer_plan_description")}</Typography>
            <Typography variant="h5" sx={{ my: 2 }}>
              {billingCycle === 'monthly' ? '$2/mes' : '$12/año'}
            </Typography>
            <SubscribeButton planType="ofertante" billingCycle={billingCycle} />
          </CardContent>
        </Card>
        <Card className="plan" sx={{ minWidth: 300 }}>
          <CardContent>
            <Typography variant="h6">{t("applicant_plan_title")}</Typography>
            <Typography>{t("applicant_plan_description")}</Typography>
            <Typography variant="h5" sx={{ my: 2 }}>
              {billingCycle === 'monthly' ? '$2/mes' : '$12/año'}
            </Typography>
            <SubscribeButton planType="postulante" billingCycle={billingCycle} />
          </CardContent>
        </Card>
      </Stack>
    </Stack>
  );
}

export default SubscriptionPage;