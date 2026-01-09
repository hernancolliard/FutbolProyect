import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Typography, Container, Button, Box } from '@mui/material';
// No longer directly importing OfferList or FeaturedProfilesCarousel here

const SeoPage = ({ title, metaDescription, h1, mainText, h2, ctaText, ctaLink, items, renderItems }) => {
  const paragraphs = mainText.split('\n\n');

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={metaDescription} />
      </Helmet>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
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

        {items && items.length > 0 && renderItems && (
          <Box sx={{ mt: 4 }}>
            {renderItems(items)}
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
