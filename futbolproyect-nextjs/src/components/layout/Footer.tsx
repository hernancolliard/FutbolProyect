'use client';

import React from "react";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import MuiLink from "@mui/material/Link"; // Renamed to MuiLink to avoid conflict with next/link
import Link from "next/link"; // Import next/link
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import Image from "next/image"; // Replaced OptimizedImage

function Footer() {
  const { t } = useTranslation('common');

  return (
    <Box
      component="footer"
      sx={{ bgcolor: "primary.main", color: "white", py: 3, mt: 6 }}
    >
      <Stack spacing={2} alignItems="center">
        <Typography variant="body2" color="inherit">
          &copy; 2025 FutbolProyect. {t("all_rights_reserved", "Todos los derechos reservados.")}
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ flexWrap: 'wrap', justifyContent: 'center' }}>
          <MuiLink component={Link} href="/privacy" color="inherit" underline="hover">
            {t("privacy_policy", "Política de Privacidad")}
          </MuiLink>
          <Typography variant="body2" color="inherit">
            |
          </Typography>
          <MuiLink component={Link} href="/terms" color="inherit" underline="hover">
            {t("terms_of_service", "Términos de Servicio")}
          </MuiLink>
        </Stack>
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', justifyContent: 'center' }}>
          <IconButton
            component={MuiLink} // Use MuiLink for IconButton component prop
            href="https://www.facebook.com/profile.php?id=61583277031848"
            target="_blank"
            rel="noopener noreferrer"
            color="inherit"
          >
            <Image
              src="/images/logos/facebook.png"
              alt="Facebook"
              width={24}
              height={24}
            />
          </IconButton>
          <IconButton
            component={MuiLink}
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            color="inherit"
          >
            <Image
              src="/images/logos/twitter.png"
              alt="Twitter"
              width={24}
              height={24}
            />
          </IconButton>
          <IconButton
            component={MuiLink}
            href="https://www.instagram.com/futbol.proyect/#"
            target="_blank"
            rel="noopener noreferrer"
            color="inherit"
          >
            <Image
              src="/images/logos/instagram.png"
              alt="Instagram"
              width={24}
              height={24}
            />
          </IconButton>
          <IconButton
            component={MuiLink}
            href="https://www.linkedin.com/company/109604115/"
            target="_blank"
            rel="noopener noreferrer"
            color="inherit"
          >
            <Image
              src="/images/logos/linkedin.png"
              alt="LinkedIn"
              width={24}
              height={24}
            />
          </IconButton>
        </Stack>
        <Typography variant="body2" color="inherit" sx={{ mt: 2 }}>
          <MuiLink
            href="https://paranadev.onrender.com/"
            target="_blank"
            rel="noopener noreferrer"
            color="inherit"
            underline="hover"
          >
            Parana Dev - Desarrollo Web
          </MuiLink>
        </Typography>
      </Stack>
    </Box>
  );
}

export default Footer;
