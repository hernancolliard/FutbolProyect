'use client';

import * as React from 'react';
import { useServerInsertedHTML } from 'next/navigation';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';

// This is a custom registry that collects all styles for Emotion,
// which Material UI uses, during server-side rendering.
export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  const [EmotionCache] = React.useState(() => {
    const cache = createCache({ key: 'mui' });
    cache.compat = true; // For compatibility mode
    return cache;
  });

  useServerInsertedHTML(() => {
    // This is the correct way to inject Emotion styles for SSR
    const serialized = EmotionCache.sheet.tags.map((tag) => tag.outerHTML).join('');
    return (
      <style
        data-emotion={`${EmotionCache.key} ${Object.keys(EmotionCache.inserted).join(' ')}`}
        dangerouslySetInnerHTML={{ __html: serialized }}
      />
    );
  });

  return (
    <CacheProvider value={EmotionCache}>
      <ThemeProvider theme={theme}>
        {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
        <CssBaseline />
        {children}
      </ThemeProvider>
    </CacheProvider>
  );
}
