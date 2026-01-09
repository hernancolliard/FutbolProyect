import React from 'react';

const OptimizedImage = ({ src, alt, width, height, ...props }) => {
  // Si no hay src, renderizar un placeholder para reservar el espacio
  if (!src) {
    // Usamos un div con estilos para simular el tamaño de la imagen
    return <div style={{ width: width, height: height, backgroundColor: '#eee' }} {...props}></div>;
  }

  // El backend ahora proporciona una URL completa y optimizada.
  // Pasamos width y height al elemento img.
  return <img src={src} alt={alt} width={width} height={height} {...props} loading="lazy" />;
};

export default OptimizedImage;
