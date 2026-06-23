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
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
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
      fetchList();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || t('club_delete_error', 'Error al eliminar club.'));
    }
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
        {items.map((it) => (
          <React.Fragment key={it.id}>
            <ListItem secondaryAction={(
              <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(it.id)}>
                <DeleteIcon />
              </IconButton>
            )}>
              <ListItemText
                primary={<span style={{ display: 'flex', justifyContent: 'space-between' }}>{it.club} <a href={it.website || '#'} target="_blank" rel="noreferrer" style={{ fontSize: 12 }}>{it.website}</a></span>}
                secondary={<>
                  <div>{it.email || ''} {it.email2 ? `| ${it.email2}` : ''} {it.email3 ? `| ${it.email3}` : ''}</div>
                  <div>{it.phone || ''} — {it.country || ''} — {it.league || ''}</div>
                </>}
              />
            </ListItem>
            <Divider />
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );
}

export default ClubContacts;
