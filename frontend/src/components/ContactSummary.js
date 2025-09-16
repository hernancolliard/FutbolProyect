import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function ContactSummary() {
  const { t } = useTranslation();

  return (
    <div className="contact-summary">
      <h2>{t('contact_title')}</h2>
      <p>{t('contact_text')}</p>
      <div className="contact-details">
        <p><strong>{t('contact_email')}</strong> info@futboljobs.com</p>
        <p><strong>{t('contact_phone')}</strong> +12 345 678 90</p>
        <p><strong>{t('contact_address')}</strong> {t('contact_address_value')}</p>
      </div>
      <Link to="/contact" className="btn-main">{t('contact_form_button')}</Link>
    </div>
  );
}

export default ContactSummary;
