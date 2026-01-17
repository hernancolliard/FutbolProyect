// futbolproyect-nextjs/src/components/shared/SeoPage.tsx
// This will be a Client Component because it handles the CTA button and rendering of items,
// which might involve client-side logic (e.g., OfferList or ProfileList are Client Components).
'use client';

import React from 'react';
import { Typography, Container, Button, Box } from '@mui/material';
import { useTranslation } from 'react-i18next'; // Client-side translation

interface SeoPageProps {
  // title and metaDescription are handled by Next.js metadata API
  h1: string;
  mainText: string;
  h2?: string;
  ctaText?: string;
  ctaLink?: string;
  children?: React.ReactNode;
}

const SeoPage = ({ h1, mainText, h2, ctaText, ctaLink, children }: SeoPageProps) => {
  const { t } = useTranslation(); // Use client-side translation here

  const paragraphs = mainText.split('\n\n');

  return (
    <>
      {/* Metadata will be handled by Next.js metadata API in page.tsx, not here */}
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <section>
          <Typography variant="h1" component="h1" sx={{ mb: 2, fontSize: '2.5rem', fontWeight: 'bold' }}>
            {h1}
          </Typography>
          {paragraphs.map((paragraph, index) => (
            <Typography variant="body1" paragraph key={index}>
              {paragraph}
            </Typography>
          ))}
          
          {h2 && (
            <Typography variant="h2" component="h2" sx={{ mt: 4, mb: 2, fontSize: '2rem', fontWeight: 'bold' }}>
              {h2}
            </Typography>
          )}
        </section>

        {children && (
          <Box sx={{ mt: 4 }}>
            {children}
          </Box>
        )}

        {ctaText && ctaLink && (
          <Box textAlign="center" sx={{ mt: 4 }}>
            <Button variant="contained" color="primary" href={ctaLink} size="large">
              {ctaText}
            </Button>
          </Box>
        )}
      </Container>
    </>
  );
};


export default SeoPage;
