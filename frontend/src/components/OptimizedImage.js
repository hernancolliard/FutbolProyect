import React from 'react';

const OptimizedImage = ({ src, alt, ...props }) => {
  // Si no hay src, no renderizar nada o un placeholder
  if (!src) {
    return null;
  }

  // El backend ahora proporciona una URL completa y optimizada.
  // Simplemente renderizamos la imagen directamente.
  return <img src={src} alt={alt} {...props} loading="lazy" />;
};

export default OptimizedImage;
