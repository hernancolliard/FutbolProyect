'use client';

import React, { useEffect, useMemo, useState } from "react";
import NextLink from "next/link";
import apiClient from "@/lib/apiClient"; // Centralized apiClient
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControl,
  InputLabel,
  Link,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import GrantSubscriptionModal from "./GrantSubscriptionModal";

const hasActiveSubscription = (user) => {
  if (user.subscription_status !== "activa") return false;

  const subscriptionEnd = user.subscription_end_date
    ? new Date(user.subscription_end_date)
    : null;

  return Boolean(
    subscriptionEnd &&
      !Number.isNaN(subscriptionEnd.getTime()) &&
      subscriptionEnd.getTime() > Date.now(),
  );
};

const copyTextToClipboard = async (text) => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed";
  textArea.style.opacity = "0";
  document.body.appendChild(textArea);
  textArea.select();
  const copied = document.execCommand("copy");
  document.body.removeChild(textArea);

  if (!copied) {
    throw new Error("Clipboard API unavailable");
  }
};

const escapeCsvValue = (value) => {
  const stringValue = String(value ?? "");

  if (/[",\r\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
};

const createMailmeteorCsv = (contacts) => {
  const rows = [
    ["Nombre", "Email"],
    ...contacts.map((contact) => [contact.nombre, contact.email]),
  ];

  return rows
    .map((row) => row.map(escapeCsvValue).join(","))
    .join("\r\n");
};

function UserManagement() {
  const { t } = useTranslation('common');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userTypeFilter, setUserTypeFilter] = useState("all");
  const [subscriptionFilter, setSubscriptionFilter] = useState("all");
  const [selectedUserIds, setSelectedUserIds] = useState(() => new Set());

  const userTypes = useMemo(
    () =>
      Array.from(
        new Set(users.map((user) => user.tipo_usuario).filter(Boolean)),
      ).sort(),
    [users],
  );

  const filteredUsers = useMemo(
    () =>
      users.filter((user) => {
        const matchesUserType =
          userTypeFilter === "all" || user.tipo_usuario === userTypeFilter;
        const isActive = hasActiveSubscription(user);
        const matchesSubscription =
          subscriptionFilter === "all" ||
          (subscriptionFilter === "active" && isActive) ||
          (subscriptionFilter === "inactive" && !isActive);

        return matchesUserType && matchesSubscription;
      }),
    [subscriptionFilter, userTypeFilter, users],
  );

  const selectedContacts = useMemo(() => {
    const contactsByEmail = new Map();

    users
      .filter((user) => selectedUserIds.has(String(user.id)))
      .forEach((user) => {
        const email = String(user.email || "").trim();
        if (!email) return;

        const normalizedEmail = email.toLowerCase();
        if (!contactsByEmail.has(normalizedEmail)) {
          contactsByEmail.set(normalizedEmail, {
            nombre: String(user.nombre || "").trim(),
            email,
          });
        }
      });

    return Array.from(contactsByEmail.values());
  }, [selectedUserIds, users]);

  const selectedContactsCsv = useMemo(
    () => createMailmeteorCsv(selectedContacts),
    [selectedContacts],
  );

  const selectedVisibleCount = filteredUsers.filter((user) =>
    selectedUserIds.has(String(user.id)),
  ).length;
  const allVisibleSelected =
    filteredUsers.length > 0 &&
    selectedVisibleCount === filteredUsers.length;
  const someVisibleSelected =
    selectedVisibleCount > 0 && !allVisibleSelected;

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
        toast.error(
          error?.response?.data?.message ||
            error?.message ||
            t('delete_user_error', 'Error al eliminar usuario.'),
        );
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

  const handleToggleUser = (userId) => {
    setSelectedUserIds((currentIds) => {
      const nextIds = new Set(currentIds);
      const normalizedId = String(userId);

      if (nextIds.has(normalizedId)) {
        nextIds.delete(normalizedId);
      } else {
        nextIds.add(normalizedId);
      }

      return nextIds;
    });
  };

  const handleToggleAllVisible = () => {
    setSelectedUserIds((currentIds) => {
      const nextIds = new Set(currentIds);

      filteredUsers.forEach((user) => {
        const normalizedId = String(user.id);
        if (allVisibleSelected) {
          nextIds.delete(normalizedId);
        } else {
          nextIds.add(normalizedId);
        }
      });

      return nextIds;
    });
  };

  const handleCopySelectedContacts = async () => {
    if (!selectedContacts.length) return;

    try {
      await copyTextToClipboard(selectedContactsCsv);
      toast.success(
        t("contacts_copied_success", {
          defaultValue: "{{count}} contactos copiados en CSV.",
          count: selectedContacts.length,
        }),
      );
    } catch (error) {
      console.error("Error copying user contacts:", error);
      toast.error(
        t("contacts_copy_error", "No se pudieron copiar los contactos."),
      );
    }
  };

  const handleDownloadSelectedContactsCsv = () => {
    if (!selectedContacts.length) return;

    const blob = new Blob([`\uFEFF${selectedContactsCsv}`], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "mailmeteor-contactos.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={1.5}
        alignItems={{ xs: "stretch", md: "center" }}
        sx={{ px: 2, pb: 2 }}
      >
        <FormControl size="small" sx={{ minWidth: 190 }}>
          <InputLabel>{t("user_type_filter", "Tipo de usuario")}</InputLabel>
          <Select
            value={userTypeFilter}
            label={t("user_type_filter", "Tipo de usuario")}
            onChange={(event) => setUserTypeFilter(event.target.value)}
          >
            <MenuItem value="all">
              {t("all_user_types", "Todos los tipos")}
            </MenuItem>
            {userTypes.map((userType) => (
              <MenuItem key={userType} value={userType}>
                {userType}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 210 }}>
          <InputLabel>
            {t("subscription_status_filter", "Estado de suscripción")}
          </InputLabel>
          <Select
            value={subscriptionFilter}
            label={t(
              "subscription_status_filter",
              "Estado de suscripción",
            )}
            onChange={(event) => setSubscriptionFilter(event.target.value)}
          >
            <MenuItem value="all">
              {t("all_subscription_statuses", "Todos los estados")}
            </MenuItem>
            <MenuItem value="active">
              {t("subscription_active", "Activa")}
            </MenuItem>
            <MenuItem value="inactive">
              {t("not_available", "No disponible")}
            </MenuItem>
          </Select>
        </FormControl>

        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {t("filtered_users_count", {
              defaultValue: "{{shown}} de {{total}} usuarios",
              shown: filteredUsers.length,
              total: users.length,
            })}
          </Typography>
        </Box>

        <Button
          variant="contained"
          onClick={handleCopySelectedContacts}
          disabled={!selectedContacts.length}
        >
          {t("copy_selected_contacts_csv", {
            defaultValue: "Copiar CSV ({{count}})",
            count: selectedContacts.length,
          })}
        </Button>
        <Button
          variant="outlined"
          onClick={handleDownloadSelectedContactsCsv}
          disabled={!selectedContacts.length}
        >
          {t("download_selected_contacts_csv", {
            defaultValue: "Descargar CSV ({{count}})",
            count: selectedContacts.length,
          })}
        </Button>
        <Button
          variant="text"
          onClick={() => setSelectedUserIds(new Set())}
          disabled={!selectedContacts.length}
        >
          {t("clear_selection", "Limpiar selección")}
        </Button>
      </Stack>

      <Table className="management-table" sx={{ minWidth: 1200 }}>
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox">
              <Checkbox
                checked={allVisibleSelected}
                indeterminate={someVisibleSelected}
                onChange={handleToggleAllVisible}
                disabled={!filteredUsers.length}
                inputProps={{
                  "aria-label": t(
                    "select_all_filtered_users",
                    "Seleccionar todos los usuarios filtrados",
                  ),
                }}
              />
            </TableCell>
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
          {filteredUsers.map((user) => {
            const isActiveSubscription = hasActiveSubscription(user);

            return (
            <TableRow key={user.id}>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selectedUserIds.has(String(user.id))}
                  onChange={() => handleToggleUser(user.id)}
                  inputProps={{
                    "aria-label": t("select_user_contact", {
                      defaultValue: "Seleccionar contacto de {{name}}",
                      name: user.nombre,
                    }),
                  }}
                />
              </TableCell>
              <TableCell>{user.id}</TableCell>
              <TableCell>
                <Link
                  component={NextLink}
                  href={`/profile/${user.id}`}
                  underline="hover"
                  sx={{ fontWeight: 700 }}
                >
                  {user.nombre}
                </Link>
              </TableCell>
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
                    color: isActiveSubscription ? 'green' : 'red',
                    fontWeight: 'bold',
                  }}
                >
                  {isActiveSubscription
                    ? t('subscription_active', 'Activa')
                    : t('not_available', 'No disponible')}
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
            );
          })}
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
