import React from "react";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import OptimizedImage from './OptimizedImage';

function Footer() {
  const { t } = useTranslation();

  return (
    <Box
      component="footer"
      sx={{ bgcolor: "primary.main", color: "white", py: 3, mt: 6 }}
    >
      <Stack spacing={2} alignItems="center">
        <Typography variant="body2" color="inherit">
          &copy; 2025 FutbolProyect. {t("all_rights_reserved")}
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <Link href="/privacy" color="inherit" underline="hover">
            {t("privacy_policy")}
          </Link>
          <Typography variant="body2" color="inherit">
            |
          </Typography>
          <Link href="/terms" color="inherit" underline="hover">
            {t("terms_of_service")}
          </Link>
        </Stack>
        <Stack direction="row" spacing={1}>
          <IconButton
            component="a"
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            color="inherit"
          >
            <OptimizedImage
              src="/images/logos/facebook.png"
              alt="Facebook"
              width={24}
              height={24}
            />
          </IconButton>
          <IconButton
            component="a"
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            color="inherit"
          >
            <OptimizedImage
              src="/images/logos/twitter.png"
              alt="Twitter"
              width={24}
              height={24}
            />
          </IconButton>
          <IconButton
            component="a"
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            color="inherit"
          >
            <OptimizedImage
              src="/images/logos/instagram.png"
              alt="Instagram"
              width={24}
              height={24}
            />
          </IconButton>
          <IconButton
            component="a"
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            color="inherit"
          >
            <OptimizedImage
              src="/images/logos/linkedin.png"
              alt="LinkedIn"
              width={24}
              height={24}
            />
          </IconButton>
        </Stack>
      </Stack>
    </Box>
  );
}

export default Footer;
