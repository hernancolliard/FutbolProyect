import React, { useState, useEffect } from "react";
import apiClient from "../services/api";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, CircularProgress, Button } from "@mui/material";
import GrantSubscriptionModal from "./GrantSubscriptionModal";

function UserManagement() {
  const { t } = useTranslation();
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
      toast.error(t('fetch_users_error'));
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (userId) => {
    if (window.confirm(t('confirm_delete_user'))) {
      try {
        await apiClient.delete(`/admin/users/${userId}`);
        toast.success(t('user_deleted_success'));
        fetchUsers(); // Refresh the list
      } catch (error) {
        toast.error(error.response?.data?.message || t('delete_user_error'));
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
      toast.success(t('grant_subscription_success'));
      fetchUsers(); // Refresh user data
      handleCloseModal();
    } catch (error) {
      toast.error(error.response?.data?.message || t('grant_subscription_error'));
      console.error("Error granting subscription:", error);
    }
  };

  if (loading) {
    return (
      <Typography align="center" sx={{ mt: 4 }}>
        <CircularProgress sx={{ mr: 2 }} />
        {t('loading_users')}
      </Typography>
    );
  }

  return (
    <TableContainer component={Paper} sx={{ mt: 4 }}>
      <Typography variant="h5" sx={{ m: 2 }}>
        {t('users_title')}
      </Typography>
      <Table className="management-table">
        <TableHead>
          <TableRow>
            <TableCell>{t('id_header')}</TableCell>
            <TableCell>{t('name_header')}</TableCell>
            <TableCell>{t('email_header')}</TableCell>
            <TableCell>{t('user_type_header')}</TableCell>
            <TableCell>{t('is_admin_header')}</TableCell>
            <TableCell>{t('created_at_header')}</TableCell>
            <TableCell>{t('actions_header')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.id}</TableCell>
              <TableCell>{user.nombre}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.tipo_usuario}</TableCell>
              <TableCell>{user.isAdmin ? t('yes') : t('no')}</TableCell>
              <TableCell>
                {new Date(user.fecha_creacion).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <Button
                  onClick={() => handleOpenModal(user)}
                  variant="outlined"
                  sx={{ mr: 1 }}
                >
                  {t('grant_subscription_button')}
                </Button>
                <Button
                  onClick={() => handleDelete(user.id)}
                  variant="outlined"
                  color="error"
                >
                  {t('delete_button')}
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
