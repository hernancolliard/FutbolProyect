'use client';

import React, { useState, useEffect } from 'react';
import apiClient from '../lib/apiClient';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
  TextField,
  Paper,
  Grid,
  IconButton,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { toast } from 'react-toastify';

function ClubContacts() {
  const { t } = useTranslation('common');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // filters
  const [country, setCountry] = useState('');
  const [league, setLeague] = useState('');
  const [q, setQ] = useState('');

  // new item form
  const [newClub, setNewClub] = useState({ club: '', website: '', email: '', email2: '', email3: '', phone: '', country: '', league: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedIds, setSelectedIds] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editingClub, setEditingClub] = useState({ club: '', website: '', email: '', email2: '', email3: '', phone: '', country: '', league: '' });

  const isAllSelected = items.length > 0 && selectedIds.length === items.length;

  useEffect(() => {
    setSelectedIds((current) => current.filter((id) => items.some((item) => item.id === id)));
  }, [items]);

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map((item) => item.id));
    }
  };

  const fetchList = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/admin/club-contacts', { params: { country: country || undefined, league: league || undefined, q: q || undefined } });
      setItems(response.data || []);
    } catch (err) {
      setError(err.message || t('club_contacts_fetch_error', 'Error al cargar contactos.'));
      toast.error(t('club_contacts_fetch_error', 'Error al cargar contactos.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = () => {
    fetchList();
  };

  const handleAdd = async () => {
    if (!newClub.club || !newClub.club.trim()) {
      toast.warn(t('club_name_required', 'El nombre del club es requerido.'));
      return;
    }
    setIsSubmitting(true);
    try {
      await apiClient.post('/admin/club-contacts', newClub);
      toast.success(t('club_added', 'Club agregado.'));
      setNewClub({ club: '', website: '', email: '', email2: '', email3: '', phone: '', country: '', league: '' });
      fetchList();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || t('club_add_error', 'Error al agregar club.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm(t('confirm_delete', '¿Confirmar eliminación?'))) return;
    try {
      await apiClient.delete(`/admin/club-contacts/${id}`);
      toast.success(t('club_deleted', 'Club eliminado.'));
      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
      fetchList();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || t('club_delete_error', 'Error al eliminar club.'));
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((selectedId) => selectedId !== id) : [...current, id],
    );
  };

  const handleCopyEmails = async () => {
    if (selectedIds.length === 0) {
      toast.warn(t('select_at_least_one', 'Seleccioná al menos un club.'));
      return;
    }

    const selectedClubs = items.filter((item) => selectedIds.includes(item.id));
    const emails = selectedClubs.reduce((acc, club) => {
      if (club.email) acc.push(club.email);
      if (club.email2) acc.push(club.email2);
      if (club.email3) acc.push(club.email3);
      return acc;
    }, []);

    if (emails.length === 0) {
      toast.warn(t('no_emails_selected', 'No hay emails para copiar.'));
      return;
    }

    const uniqueEmails = Array.from(new Set(emails));
    const textToCopy = uniqueEmails.join(', ');

    try {
      await navigator.clipboard.writeText(textToCopy);
      toast.success(t('emails_copied', 'Emails copiados al portapapeles.'));
    } catch (err) {
      toast.error(t('copy_error', 'No se pudo copiar al portapapeles.'));
    }
  };

  const startEdit = (club) => {
    setEditingId(club.id);
    setEditingClub({
      club: club.club || '',
      website: club.website || '',
      email: club.email || '',
      email2: club.email2 || '',
      email3: club.email3 || '',
      phone: club.phone || '',
      country: club.country || '',
      league: club.league || '',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingClub({ club: '', website: '', email: '', email2: '', email3: '', phone: '', country: '', league: '' });
  };

  const handleSave = async () => {
    if (!editingClub.club || !editingClub.club.trim()) {
      toast.warn(t('club_name_required', 'El nombre del club es requerido.'));
      return;
    }

    try {
      await apiClient.put(`/admin/club-contacts/${editingId}`, editingClub);
      toast.success(t('club_updated', 'Club actualizado.'));
      cancelEdit();
      fetchList();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || t('club_update_error', 'Error al actualizar club.'));
    }
  };

  const handleEditChange = (field, value) => {
    setEditingClub((current) => ({ ...current, [field]: value }));
  };

  if (loading) return (<Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>);
  if (error) return (<Alert severity="error">{error}</Alert>);

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>{t('club_contacts_title', 'Contactos de Clubes')}</Typography>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={3}>
          <TextField label={t('filter_country', 'País')} value={country} onChange={(e) => setCountry(e.target.value)} fullWidth />
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField label={t('filter_league', 'Liga')} value={league} onChange={(e) => setLeague(e.target.value)} fullWidth />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField label={t('search_name', 'Buscar nombre')} value={q} onChange={(e) => setQ(e.target.value)} fullWidth onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
        </Grid>
        <Grid item xs={12} md={2}>
          <Button variant="contained" onClick={handleSearch} fullWidth>{t('search_button', 'Buscar')}</Button>
        </Grid>
      </Grid>

      <Grid container spacing={1} sx={{ mb: 3, alignItems: 'center' }}>
        <Grid item>
          <FormControlLabel
            control={
              <Checkbox
                checked={isAllSelected}
                indeterminate={selectedIds.length > 0 && selectedIds.length < items.length}
                onChange={handleToggleSelectAll}
              />
            }
            label={t('select_all', 'Seleccionar todos')}
          />
        </Grid>
        <Grid item>
          <Button variant="outlined" startIcon={<ContentCopyIcon />} onClick={handleCopyEmails}>
            {t('copy_selected_emails', 'Copiar emails seleccionados')}
          </Button>
        </Grid>
        <Grid item>
          <Typography variant="body2">{selectedIds.length} {t('clubs_selected', 'clubes seleccionados')}</Typography>
        </Grid>
      </Grid>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h6">{t('add_new_club', 'Agregar nuevo club')}</Typography>
        <Grid container spacing={1} sx={{ mt: 1 }}>
          <Grid item xs={12} md={4}><TextField label={t('club_name', 'Club')} value={newClub.club} onChange={(e) => setNewClub({ ...newClub, club: e.target.value })} fullWidth /></Grid>
          <Grid item xs={12} md={4}><TextField label={t('website', 'Página web')} value={newClub.website} onChange={(e) => setNewClub({ ...newClub, website: e.target.value })} fullWidth /></Grid>
          <Grid item xs={12} md={4}><TextField label={t('email', 'Email')} value={newClub.email} onChange={(e) => setNewClub({ ...newClub, email: e.target.value })} fullWidth /></Grid>
          <Grid item xs={12} md={4}><TextField label={t('email2', 'Email 2')} value={newClub.email2} onChange={(e) => setNewClub({ ...newClub, email2: e.target.value })} fullWidth /></Grid>
          <Grid item xs={12} md={4}><TextField label={t('email3', 'Email 3')} value={newClub.email3} onChange={(e) => setNewClub({ ...newClub, email3: e.target.value })} fullWidth /></Grid>
          <Grid item xs={12} md={4}><TextField label={t('phone', 'Teléfono')} value={newClub.phone} onChange={(e) => setNewClub({ ...newClub, phone: e.target.value })} fullWidth /></Grid>
          <Grid item xs={12} md={4}><TextField label={t('country', 'País')} value={newClub.country} onChange={(e) => setNewClub({ ...newClub, country: e.target.value })} fullWidth /></Grid>
          <Grid item xs={12} md={4}><TextField label={t('league', 'Liga')} value={newClub.league} onChange={(e) => setNewClub({ ...newClub, league: e.target.value })} fullWidth /></Grid>
          <Grid item xs={12} md={4}><Button variant="contained" onClick={handleAdd} disabled={isSubmitting}>{isSubmitting ? '...' : t('add_button', 'Agregar')}</Button></Grid>
        </Grid>
      </Box>

      <List>
        {items.map((it) => {
          const isEditing = editingId === it.id;
          return (
            <React.Fragment key={it.id}>
              <ListItem alignItems="flex-start" sx={{ py: 2 }}>
                <Checkbox
                  checked={selectedIds.includes(it.id)}
                  onChange={() => handleToggleSelect(it.id)}
                  sx={{ mr: 2 }}
                />
                <ListItemText
                  primary={
                    isEditing ? (
                      <TextField
                        label={t('club_name', 'Club')}
                        value={editingClub.club}
                        onChange={(e) => handleEditChange('club', e.target.value)}
                        fullWidth
                        sx={{ mb: 1 }}
                      />
                    ) : (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle1">{it.club}</Typography>
                        <Typography component="a" href={it.website || '#'} target="_blank" rel="noreferrer" sx={{ fontSize: 12 }}>
                          {it.website}
                        </Typography>
                      </Box>
                    )
                  }
                  secondary={
                    isEditing ? (
                      <Box sx={{ mt: 1 }}>
                        <Grid container spacing={1}>
                          <Grid item xs={12} md={4}><TextField label={t('website', 'Página web')} value={editingClub.website} onChange={(e) => handleEditChange('website', e.target.value)} fullWidth /></Grid>
                          <Grid item xs={12} md={4}><TextField label={t('email', 'Email')} value={editingClub.email} onChange={(e) => handleEditChange('email', e.target.value)} fullWidth /></Grid>
                          <Grid item xs={12} md={4}><TextField label={t('email2', 'Email 2')} value={editingClub.email2} onChange={(e) => handleEditChange('email2', e.target.value)} fullWidth /></Grid>
                          <Grid item xs={12} md={4}><TextField label={t('email3', 'Email 3')} value={editingClub.email3} onChange={(e) => handleEditChange('email3', e.target.value)} fullWidth /></Grid>
                          <Grid item xs={12} md={4}><TextField label={t('phone', 'Teléfono')} value={editingClub.phone} onChange={(e) => handleEditChange('phone', e.target.value)} fullWidth /></Grid>
                          <Grid item xs={12} md={4}><TextField label={t('country', 'País')} value={editingClub.country} onChange={(e) => handleEditChange('country', e.target.value)} fullWidth /></Grid>
                          <Grid item xs={12} md={4}><TextField label={t('league', 'Liga')} value={editingClub.league} onChange={(e) => handleEditChange('league', e.target.value)} fullWidth /></Grid>
                          <Grid item xs={12} md={8}>
                            <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave} sx={{ mr: 1 }}>
                              {t('save_button', 'Guardar')}
                            </Button>
                            <Button variant="outlined" startIcon={<CancelIcon />} onClick={cancelEdit}>
                              {t('cancel_button', 'Cancelar')}
                            </Button>
                          </Grid>
                        </Grid>
                      </Box>
                    ) : (
                      <>
                        <Typography>{[it.email, it.email2, it.email3].filter(Boolean).join(' | ')}</Typography>
                        <Typography variant="body2" color="text.secondary">{[it.phone, it.country, it.league].filter(Boolean).join(' — ')}</Typography>
                      </>
                    )
                  }
                />
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  {!isEditing && (
                    <IconButton edge="end" aria-label="edit" onClick={() => startEdit(it)}>
                      <EditIcon />
                    </IconButton>
                  )}
                  <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(it.id)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </ListItem>
              <Divider />
            </React.Fragment>
          );
        })}
      </List>
    </Paper>
  );
}

export default ClubContacts;
