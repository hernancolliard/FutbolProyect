'use client';

import { useState, useEffect } from 'react';

const useIsMobile = (breakpoint = 768) => {
  // Initialize with a default value or calculate on mount
  const [isMobile, setIsMobile] = useState(false); 

  useEffect(() => {
    // Only run this effect on the client side after hydration
    const handleResize = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    // Set initial value
    setIsMobile(window.innerWidth < breakpoint);

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [breakpoint]); // Depend on breakpoint

  return isMobile;
};

export default useIsMobile;