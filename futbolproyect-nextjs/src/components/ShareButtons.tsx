'use client';

import React, { useState } from 'react';
import { FaFacebook, FaLinkedin, FaWhatsapp, FaInstagram, FaDownload } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { Box, Typography, Button } from '@mui/material'; // Import Material UI components

const ShareButtons = ({ title, url, onDownload }) => {
  const [copied, setCopied] = useState(false);
  const { t } = useTranslation('common');

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const socialLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset message after 2 seconds
    });
  };

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 1,
    }}>
      <Typography variant="h6">{t('share', 'Compartir')}</Typography>
      <Box sx={{
        display: 'flex',
        gap: 1,
      }}>
        <Button
          component="a"
          href={socialLinks.facebook}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on Facebook"
          sx={{ minWidth: 0, padding: '8px', color: '#1877F2' }} // Facebook blue
        >
          <FaFacebook size={24} />
        </Button>
        <Button
          component="a"
          href={socialLinks.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on LinkedIn"
          sx={{ minWidth: 0, padding: '8px', color: '#0A66C2' }} // LinkedIn blue
        >
          <FaLinkedin size={24} />
        </Button>
        <Button
          component="a"
          href={socialLinks.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on WhatsApp"
          sx={{ minWidth: 0, padding: '8px', color: '#25D366' }} // WhatsApp green
        >
          <FaWhatsapp size={24} />
        </Button>
        <Button
          onClick={copyToClipboard}
          aria-label="Copy link for Instagram"
          sx={{ minWidth: 0, padding: '8px', color: '#C13584' }} // Instagram purple/pink
        >
          <FaInstagram size={24} />
        </Button>
        {onDownload && (
          <Button
            onClick={onDownload}
            aria-label="Download"
            sx={{ minWidth: 0, padding: '8px', color: 'text.secondary' }}
          >
            <FaDownload size={24} />
          </Button>
        )}
      </Box>
      {copied && <Typography variant="caption" sx={{ mt: 1 }}>{t('linkCopiedInstagram', 'Enlace copiado para Instagram')}</Typography>}
    </Box>
  );
};

export default ShareButtons;
