'use client';

import React, { useState } from 'react';
import { FaFacebook, FaLinkedin, FaWhatsapp, FaInstagram, FaDownload } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { Box, Typography, IconButton, Tooltip } from '@mui/material';

interface ShareButtonsProps {
    title: string;
    url: string;
    onDownload?: () => void;
}

const ShareButtons = ({ title, url, onDownload }: ShareButtonsProps) => {
  const [copied, setCopied] = useState(false);
  const { t } = useTranslation();

  // Ensure URL is absolute for sharing
  const absoluteUrl = url.startsWith('http') ? url : `${process.env.NEXT_PUBLIC_BASE_URL}${url}`;

  const encodedUrl = encodeURIComponent(absoluteUrl);
  const encodedTitle = encodeURIComponent(title);

  const socialLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(absoluteUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset message after 2 seconds
    });
  };

  return (
    <Box sx={{ my: 2, textAlign: 'center' }}>
      <Typography variant="h6" component="h4" sx={{ mb: 1 }}>{t('share', 'Compartir')}</Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
        <Tooltip title="Facebook">
            <IconButton component="a" href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook">
                <FaFacebook size={28} />
            </IconButton>
        </Tooltip>
        <Tooltip title="LinkedIn">
            <IconButton component="a" href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" aria-label="Share on LinkedIn">
                <FaLinkedin size={28} />
            </IconButton>
        </Tooltip>
        <Tooltip title="WhatsApp">
            <IconButton component="a" href={socialLinks.whatsapp} target="_blank" rel="noopener noreferrer" aria-label="Share on WhatsApp">
                <FaWhatsapp size={28} />
            </IconButton>
        </Tooltip>
        <Tooltip title={t('copy_link_for_instagram', 'Copiar enlace para Instagram')}>
            <IconButton onClick={copyToClipboard} aria-label="Copy link for Instagram">
                <FaInstagram size={28} />
            </IconButton>
        </Tooltip>
        {onDownload && (
            <Tooltip title={t('download_offer', 'Descargar Oferta')}>
                <IconButton onClick={onDownload} aria-label="Download offer">
                    <FaDownload size={28} />
                </IconButton>
            </Tooltip>
        )}
      </Box>
      {copied && <Typography sx={{ mt: 1, color: 'success.main', fontWeight: 'bold' }}>{t('linkCopiedInstagram', 'Enlace copiado!')}</Typography>}
    </Box>
  );
};

export default ShareButtons;
