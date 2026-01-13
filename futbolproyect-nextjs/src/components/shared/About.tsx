// futbolproyect-nextjs/src/components/shared/About.tsx
// This is a Server Component.
import React from 'react';
import Image from 'next/image'; // Use next/image
import { getTranslation } from '@/lib/i18n-server'; // Server-side translation helper

const About = async () => {
  const translations = await getTranslation('es'); // Or dynamically determine locale

  // Images are referenced directly from /public
  const aboutImageWebp = '/images/nosotros.webp';

  return (
    // <FadeInOnScroll> // FadeInOnScroll is a Client Component and will wrap this in page.tsx
      <div className="info-section">
        <div className="info-image">
          <Image
            src={aboutImageWebp} // Prefer webp if available
            alt={translations.about_us_title}
            width={500} // Placeholder, need actual image dimensions
            height={300} // Placeholder, need actual image dimensions
            // layout="responsive" // Can be used if image dimensions are known
          />
        </div>
        <div className="info-text">
          <h2>{translations.about_us_title}</h2>
          <p>
            {translations.about_us_text}
          </p>
        </div>
      </div>
    // </FadeInOnScroll>
  );
}

export default About;
