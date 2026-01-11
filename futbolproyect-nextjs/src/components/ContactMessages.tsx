'use client';

import React, { useState, useEffect } from 'react';
import apiClient from '../../lib/apiClient'; // Centralized apiClient
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
  Modal,
  TextField,
  Paper,
  Chip,
} from '@mui/material';
import { toast } from 'react-toastify';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
};

function ContactMessages() {
  const { t } = useTranslation('common');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/admin/contact-messages');
      setMessages(response.data);
    } catch (err) {
      setError(err.message || t('contact_messages_fetch_error', 'Error al cargar los mensajes de contacto.'));
      toast.error(t('contact_messages_fetch_error', 'Error al cargar los mensajes de contacto.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleOpenModal = (message) => {
    setSelectedMessage(message);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedMessage(null);
    setIsModalOpen(false);
    setReplyText('');
  };

  const handleReplySubmit = async () => {
    if (!replyText.trim()) {
      toast.warn(t('reply_message_empty', 'El mensaje de respuesta no puede estar vacío.'));
      return;
    }
    setIsSubmitting(true);
    try {
      await apiClient.post(`/admin/contact-messages/${selectedMessage.id}/reply`, {
        replyMessage: replyText,
      });
      toast.success(t('reply_sent_success', 'Respuesta enviada con éxito.'));
      handleCloseModal();
      fetchMessages(); // Refresh messages
    } catch (err) {
      toast.error(err.message || t('reply_sent_error', 'Error al enviar la respuesta.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        {t('contact_messages_title', 'Mensajes de Contacto')}
      </Typography>
      <List>
        {messages.map((msg) => (
          <React.Fragment key={msg.id}>
            <ListItem alignItems="flex-start">
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle1">{msg.name} ({msg.email})</Typography>
                    <Chip
                      label={t(msg.status, msg.status)}
                      color={msg.status === 'replied' ? 'success' : 'primary'}
                      size="small"
                    />
                  </Box>
                }
                secondary={
                  <>
                    <Typography component="span" variant="body2" color="text.primary">
                      {msg.message}
                    </Typography>
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                      {new Date(msg.created_at).toLocaleString()}
                    </Typography>
                    {msg.status === 'new' && (
                      <Button
                        variant="outlined"
                        size="small"
                        sx={{ mt: 1 }}
                        onClick={() => handleOpenModal(msg)}
                      >
                        {t('reply_button', 'Responder')}
                      </Button>
                    )}
                    {msg.status === 'replied' && msg.reply_message && (
                        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                            <Typography variant="subtitle2"><strong>{t('your_reply', 'Tu respuesta')}:</strong></Typography>
                            <Typography variant="body2">{msg.reply_message}</Typography>
                        </Box>
                    )}
                  </>
                }
              />
            </ListItem>
            <Divider />
          </React.Fragment>
        ))}
      </List>

      <Modal open={isModalOpen} onClose={handleCloseModal}>
        <Box sx={style}>
          <Typography variant="h6" component="h2">
            {t('reply_to', 'Responder a')} {selectedMessage?.name}
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            label={t('your_reply_label', 'Tu respuesta')}
            margin="normal"
            disabled={isSubmitting}
          />
          <Button
            onClick={handleReplySubmit}
            variant="contained"
            disabled={isSubmitting}
          >
            {isSubmitting ? <CircularProgress size={24} /> : t('send_reply_button', 'Enviar Respuesta')}
          </Button>
        </Box>
      </Modal>
    </Paper>
  );
}

export default ContactMessages;
