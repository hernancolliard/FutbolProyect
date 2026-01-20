"use client";
import React from 'react';
import Image from 'next/image';
import { useTranslation } from "react-i18next";
import { Box, Typography, Card, CardContent } from "@mui/material"; // Importar Box y Typography

const Mission = () => {
  const { t } = useTranslation();

  const missionImageWebp = '/mision.webp'; // Ruta corregida

  return (
    <Card
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row-reverse' }, // Columna en móvil, fila inversa en PC
        alignItems: 'center',
        boxShadow: 3, // Leve sombra
        p: 2, // Padding interno
        mb: 4, // Margen inferior
        backgroundColor: 'background.paper', // Fondo de la tarjeta
      }}
    >
      <Box
        sx={{
          flexShrink: 0, // Evitar que la imagen se encoja
          width: { xs: '100%', md: '50%' }, // Ancho completo en móvil, 50% en PC
          mb: { xs: 2, md: 0 }, // Margen inferior en móvil, ninguno en PC
          ml: { xs: 0, md: 4 }, // Margen izquierdo en PC, ninguno en móvil
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Image
          src={missionImageWebp}
          alt={t('mission_title')}
          width={500}
          height={300}
          style={{
            maxWidth: '100%',
            height: 'auto',
            objectFit: 'contain', // Ajustar imagen
          }}
        />
      </Box>
      <CardContent
        sx={{
          flexGrow: 1, // El texto ocupa el espacio restante
          textAlign: 'center', // Centrado en todas las pantallas
          color: 'text.primary',
        }}
      >
        <Typography variant="h4" component="h2" gutterBottom
          sx={{
            fontSize: { xs: '1.8rem', md: '2.5rem' }, // Ajustar tamaño de título en PC
          }}
        >
          {t('mission_title')}
        </Typography>
        <Typography variant="body1"
          sx={{
            fontSize: { xs: '1rem', md: '1.2rem' }, // Ajustar tamaño de texto en PC
          }}
        >
          {t('mission_text')}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default Mission;