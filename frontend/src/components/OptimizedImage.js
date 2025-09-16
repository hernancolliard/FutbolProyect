import React from 'react';

const OptimizedImage = ({ src, alt, ...props }) => {
  const webpSrc = src.replace(/\.(jpe?g|png)$/i, '.webp');

  return (
    <picture>
      <source srcSet={webpSrc} type="image/webp" />
      <source srcSet={src} type={src.endsWith('.png') ? 'image/png' : 'image/jpeg'} />
      <img src={src} alt={alt} {...props} loading="lazy" />
    </picture>
  );
};

export default OptimizedImage;
