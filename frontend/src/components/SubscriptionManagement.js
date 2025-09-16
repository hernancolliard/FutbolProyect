import React, { useState, useEffect } from 'react';
import apiClient from '../services/api';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, TextField, Button, CircularProgress } from '@mui/material';

function SubscriptionManagement() {
  const { t } = useTranslation();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editCache, setEditCache] = useState({});

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/admin/subscriptions');
      setPlans(response.data);
    } catch (error) {
      toast.error(t('fetch_plans_error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handlePriceChange = (id, field, value) => {
    setEditCache(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const handleSave = async (id) => {
    const originalPlan = plans.find(p => p.id === id);
    const editedValues = editCache[id];
    if (!editedValues || !originalPlan) return;

    const planToUpdate = {
        ...originalPlan,
        ...editedValues,
    };

    const price_usd = parseFloat(planToUpdate.price_usd);
    const price_mp = parseInt(planToUpdate.price_mp, 10);

    if (isNaN(price_usd) || isNaN(price_mp)) {
        toast.error("Prices must be valid numbers.");
        return;
    }

    const numericPlan = {
        price_usd: price_usd,
        price_mp: price_mp,
    };

    try {
      await apiClient.put(`/admin/subscriptions/${id}`, numericPlan);
      toast.success(t('plan_updated_success'));
      setEditCache(prev => {
        const newCache = { ...prev };
        delete newCache[id];
        return newCache;
      });
      fetchPlans(); // Refresh data
    } catch (error) {
      toast.error(error.response?.data?.message || t('update_plan_error'));
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <TableContainer component={Paper} sx={{ mt: 4 }}>
      <Typography variant="h5" sx={{ m: 2 }}>
        {t('subscription_plans_title')}
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>{t('plan_name_header')}</TableCell>
            <TableCell>{t('price_usd_header')}</TableCell>
            <TableCell>{t('price_mp_header')}</TableCell>
            <TableCell>{t('active_header')}</TableCell>
            <TableCell>{t('actions_header')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {plans.map((plan) => (
            <TableRow key={plan.id}>
              <TableCell>{plan.plan_name}</TableCell>
              <TableCell>
                <TextField
                  type="number"
                  value={editCache[plan.id]?.price_usd ?? plan.price_usd}
                  onChange={(e) => handlePriceChange(plan.id, 'price_usd', e.target.value)}
                />
              </TableCell>
              <TableCell>
                <TextField
                  type="number"
                  value={editCache[plan.id]?.price_mp ?? plan.price_mp}
                  onChange={(e) => handlePriceChange(plan.id, 'price_mp', e.target.value)}
                />
              </TableCell>
              <TableCell>{plan.is_active ? t('yes') : t('no')}</TableCell>
              <TableCell>
                <Button 
                  variant="contained" 
                  onClick={() => handleSave(plan.id)}
                  disabled={!editCache[plan.id]}
                >
                  {t('save_button')}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default SubscriptionManagement;