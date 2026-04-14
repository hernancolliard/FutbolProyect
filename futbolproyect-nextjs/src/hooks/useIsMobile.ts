'use client';

import { useState, useEffect } from 'react';

const useIsMobile = (breakpoint = 768) => {
  // Initialize as null to prevent hydration mismatch
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    // Set initial value after hydration
    checkIsMobile();

    // Add event listener for window resize
    window.addEventListener('resize', checkIsMobile);

    // Clean up event listener on component unmount
    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, [breakpoint]);

  // Return false during hydration, then the actual value
  return isMobile === null ? false : isMobile;
};

export default useIsMobile;
