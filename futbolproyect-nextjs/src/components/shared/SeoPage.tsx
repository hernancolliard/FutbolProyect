import React from "react";
import { Typography, Container, Button, Box } from "@mui/material";

interface SeoPageProps {
  h1: string;
  mainText?: string;
  h2?: string;
  ctaText?: string;
  ctaLink?: string;
  children?: React.ReactNode;
}

const SeoPage = ({
  h1,
  mainText,
  h2,
  ctaText,
  ctaLink,
  children,
}: SeoPageProps) => {
  const paragraphs = (mainText || "").split("\n\n");

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <section>
        <Typography
          variant="h1"
          component="h1"
          sx={{
            mb: 2,
            fontSize: "2.5rem",
            fontWeight: "bold",
            textAlign: "center",
          }}
        >
          {h1}
        </Typography>

        {paragraphs.map((paragraph, index) => (
          <Typography variant="body1" paragraph key={index}>
            {paragraph}
          </Typography>
        ))}

        {h2 && (
          <Typography
            variant="h2"
            component="h2"
            sx={{
              mt: 4,
              mb: 2,
              fontSize: "2rem",
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            {h2}
          </Typography>
        )}
      </section>

      {children && <Box sx={{ mt: 4 }}>{children}</Box>}

      {ctaText && ctaLink && (
        <Box textAlign="center" sx={{ mt: 4 }}>
          <Button
            variant="contained"
            color="primary"
            href={ctaLink}
            size="large"
          >
            {ctaText}
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default SeoPage;
