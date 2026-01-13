// futbolproyect-nextjs/src/components/shared/ContactSummary.tsx
// This will be a Server Component.
import React from 'react';
import Link from 'next/link'; // Use next/link
import { getTranslation } from '@/lib/i18n-server'; // Server-side translation helper

const ContactSummary = async () => {
  const { translations } = await getTranslation('es'); // Or dynamically determine locale

  return (
    // <FadeInOnScroll> // FadeInOnScroll is a Client Component and will wrap this in page.tsx
      <div className="contact-summary-container">
        <h2>{translations.contact_title}</h2>
        <p>{translations.contact_text}</p>
        <Link href="/contact" className="btn-main">
          {translations.contact_form_button}
        </Link>
      </div>
    // </FadeInOnScroll>
  );
}

export default ContactSummary;