'use client';

import React, { useState, useEffect } from "react";
import apiClient from "@/lib/apiClient"; // Centralized apiClient
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, CircularProgress, Button } from "@mui/material";
import GrantSubscriptionModal from "./GrantSubscriptionModal";

function UserManagement() {
  const { t } = useTranslation('common');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get("/admin/users");
      setUsers(response.data);
    } catch (error) {
      toast.error(error.message || t('fetch_users_error', 'Error al cargar usuarios.'));
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (userId) => {
    if (window.confirm(t('confirm_delete_user', '¿Estás seguro de que quieres eliminar este usuario?'))) {
      try {
        await apiClient.delete(`/admin/users/${userId}`);
        toast.success(t('user_deleted_success', 'Usuario eliminado con éxito.'));
        fetchUsers(); // Refresh the list
      } catch (error) {
        toast.error(error.message || t('delete_user_error', 'Error al eliminar usuario.'));
        console.error("Error deleting user:", error);
      }
    }
  };

  const handleOpenModal = (user) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
    setModalOpen(false);
  };

  const handleGrantSubscription = async (userId, { planType, duration }) => {
    try {
      await apiClient.post(`/admin/users/${userId}/grant-subscription`, { planType, duration });
      toast.success(t('grant_subscription_success', 'Suscripción otorgada con éxito.'));
      fetchUsers(); // Refresh user data
      handleCloseModal();
    } catch (error) {
      toast.error(error.message || t('grant_subscription_error', 'Error al otorgar suscripción.'));
      console.error("Error granting subscription:", error);
    }
  };

  if (loading) {
    return (
      <Typography align="center" sx={{ mt: 4 }}>
        <CircularProgress sx={{ mr: 2 }} />
        {t('loading_users', 'Cargando usuarios...')}
      </Typography>
    );
  }

  return (
    <TableContainer component={Paper} sx={{ mt: 4 }}>
      <Typography variant="h5" sx={{ m: 2 }}>
        {t('users_title', 'Gestión de Usuarios')}
      </Typography>
      <Table className="management-table">
        <TableHead>
          <TableRow>
            <TableCell>{t('id_header', 'ID')}</TableCell>
            <TableCell>{t('name_header', 'Nombre')}</TableCell>
            <TableCell>{t('email_header', 'Email')}</TableCell>
            <TableCell>{t('user_type_header', 'Tipo de Usuario')}</TableCell>
            <TableCell>{t('subscription_plan', 'Plan')}</TableCell>
            <TableCell>{t('subscription_end_date', 'Fin Suscripción')}</TableCell>
            <TableCell>{t('subscription_status', 'Estado Suscripción')}</TableCell>
            <TableCell>{t('profile_views_header', 'Vistas Perfil')}</TableCell>
            <TableCell>{t('is_admin_header', 'Es Admin')}</TableCell>
            <TableCell>{t('created_at_header', 'Fecha Creación')}</TableCell>
            <TableCell sx={{ width: '220px' }}>{t('actions_header', 'Acciones')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.id}</TableCell>
              <TableCell>{user.nombre}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.tipo_usuario}</TableCell>
              <TableCell>{user.subscription_plan || t('na', 'N/A')}</TableCell>
              <TableCell>
                {user.subscription_end_date
                  ? new Date(user.subscription_end_date).toLocaleDateString()
                  : t('na', 'N/A')}
              </TableCell>
              <TableCell>
                <span
                  style={{
                    color: user.subscription_status === 'activa' ? 'green' : 'red',
                    fontWeight: 'bold',
                  }}
                >
                  {user.subscription_status || t('na', 'N/A')}
                </span>
              </TableCell>
              <TableCell>{user.profile_views}</TableCell>
              <TableCell>{user.isadmin ? t('yes', 'Sí') : t('no', 'No')}</TableCell>
              <TableCell>
                {new Date(user.fecha_creacion).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <Button
                  onClick={() => handleOpenModal(user)}
                  variant="outlined"
                  size="small"
                  sx={{ mr: 1, mb: { xs: 1, sm: 0 } }}
                >
                  {t('grant_subscription_button', 'Otorgar Suscripción')}
                </Button>
                <Button
                  onClick={() => handleDelete(user.id)}
                  variant="outlined"
                  size="small"
                  color="error"
                >
                  {t('delete_button', 'Eliminar')}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {selectedUser && (
        <GrantSubscriptionModal
          open={modalOpen}
          onClose={handleCloseModal}
          onGrant={handleGrantSubscription}
          user={selectedUser}
        />
      )}
    </TableContainer>
  );
}

export default UserManagement;
