"use client";
import React from 'react';
import Link from 'next/link';
import { useTranslation } from "react-i18next";

const ContactSummary = () => {
  const { t } = useTranslation();

  return (
      <div className="contact-summary-container">
        <h2>{t('contact_title')}</h2>
        <p>{t('contact_text')}</p>
        <Link href="/contact" className="btn-main">
          {t('contact_form_button')}
        </Link>
      </div>
  );
}

export default ContactSummary;