// futbolproyect-nextjs/src/components/shared/Mission.tsx
// This is a Server Component.
import React from 'react';
import Image from 'next/image'; // Use next/image
import { getTranslation } from '@/lib/i18n-server'; // Server-side translation helper

const Mission = async () => {
  const translations = await getTranslation('es'); // Or dynamically determine locale

  // Images are referenced directly from /public
  const missionImageWebp = '/images/mision.webp';

  return (
    // <FadeInOnScroll> // FadeInOnScroll is a Client Component and will wrap this in page.tsx
      <div className="info-section reverse">
        <div className="info-image">
          <Image
            src={missionImageWebp} // Prefer webp if available
            alt={translations.mission_title}
            width={500} // Placeholder, need actual image dimensions
            height={300} // Placeholder, need actual image dimensions
            // layout="responsive" // Can be used if image dimensions are known
          />
        </div>
        <div className="info-text">
          <h2>{translations.mission_title}</h2>
          <p>
            {translations.mission_text}
          </p>
        </div>
      </div>
    // </FadeInOnScroll>
  );
}

export default Mission;
