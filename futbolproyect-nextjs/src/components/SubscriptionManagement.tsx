'use client';

import React, { useState } from 'react';
import apiClient from '@/lib/apiClient'; // Centralized apiClient
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, TextField, Button, CircularProgress } from '@mui/material';

// --- Fetching Logic ---
const fetchPlans = async () => {
  const { data } = await apiClient.get('/admin/subscriptions');
  return data;
};

// --- Mutation Logic ---
const updatePlan = async ({ id, ...planData }) => {
  const { data } = await apiClient.put(`/admin/subscriptions/${id}`, planData);
  return data;
};

function SubscriptionManagement() {
  const { t } = useTranslation('common');
  const queryClient = useQueryClient();
  const [editCache, setEditCache] = useState({});

  const { data: plans, isLoading, isError } = useQuery({
    queryKey: ['adminSubscriptionPlans'],
    queryFn: fetchPlans,
  });

  const { mutate: savePlan, isPending: isSaving } = useMutation({
    mutationFn: updatePlan,
    onSuccess: () => {
      toast.success(t('plan_updated_success', 'Plan actualizado con éxito.'));
      // Invalidate both admin and public queries
      queryClient.invalidateQueries({ queryKey: ['adminSubscriptionPlans'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptionPlans'] });
      setEditCache({}); // Clear local edits
    },
    onError: (error) => {
      toast.error(error.message || t('update_plan_error', 'Error al actualizar el plan.'));
    },
  });

  const handlePriceChange = (id, field, value) => {
    setEditCache(prev => ({
      ...prev,
      [id]: { ...(prev[id] || {}), [field]: value },
    }));
  };

  const handleSave = (id) => {
    const originalPlan = plans.find(p => p.id === id);
    const editedValues = editCache[id];
    if (!editedValues || !originalPlan) return;

    const price_usd = parseFloat(editedValues.price_usd ?? originalPlan.price_usd);
    const price_mp = parseInt(editedValues.price_mp ?? originalPlan.price_mp, 10);

    if (isNaN(price_usd) || isNaN(price_mp)) {
      toast.error(t('invalid_prices_error', "Los precios deben ser números válidos."));
      return;
    }

    savePlan({ id, price_usd, price_mp });
  };

  if (isLoading) {
    return (
      <Typography align="center" sx={{ mt: 4 }}>
        <CircularProgress sx={{ mr: 2 }} />
        {t('loading_plans', 'Cargando planes...')}
      </Typography>
    );
  }

  if (isError) {
    return <Typography color="error">{t('fetch_plans_error', 'Error al cargar los planes de suscripción.')}</Typography>;
  }

  return (
    <TableContainer component={Paper} sx={{ mt: 4 }}>
      <Typography variant="h5" sx={{ m: 2 }}>
        {t('subscription_plans_title', 'Gestión de Planes de Suscripción')}
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>{t('plan_name_header', 'Nombre del Plan')}</TableCell>
            <TableCell>{t('price_usd_header', 'Precio USD')}</TableCell>
            <TableCell>{t('price_mp_header', 'Precio MP')}</TableCell>
            <TableCell>{t('active_header', 'Activo')}</TableCell>
            <TableCell>{t('actions_header', 'Acciones')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {plans?.map((plan) => (
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
              <TableCell>{plan.is_active ? t('yes', 'Sí') : t('no', 'No')}</TableCell>
              <TableCell>
                <Button 
                  variant="contained" 
                  onClick={() => handleSave(plan.id)}
                  disabled={!editCache[plan.id] || isSaving}
                >
                  {isSaving ? <CircularProgress size={24} /> : t('save_button', 'Guardar')}
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