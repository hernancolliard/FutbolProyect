import React, { useState } from 'react';
import { FaFacebook, FaLinkedin, FaWhatsapp, FaInstagram } from 'react-icons/fa';
import './ShareButtons.css';
import { useTranslation } from 'react-i18next';

const ShareButtons = ({ title, url }) => {
  const [copied, setCopied] = useState(false);
  const { t } = useTranslation();

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
    <div className="share-buttons-container">
      <h4>{t('share')}</h4>
      <div className="share-buttons">
        <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook">
          <FaFacebook size={32} />
        </a>
        <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" aria-label="Share on LinkedIn">
          <FaLinkedin size={32} />
        </a>
        <a href={socialLinks.whatsapp} target="_blank" rel="noopener noreferrer" aria-label="Share on WhatsApp">
          <FaWhatsapp size={32} />
        </a>
        <button onClick={copyToClipboard} aria-label="Copy link for Instagram">
          <FaInstagram size={32} />
        </button>
      </div>
      {copied && <p className="copied-message">{t('linkCopiedInstagram')}</p>}
    </div>
  );
};

export default ShareButtons;
