'use client';

import { useState, useEffect } from 'react';

const useIsMobile = (breakpoint = 768) => {
  // Initialize as null to prevent hydration mismatch
  const [isMobile, setIsMobile] = useState<boolean | null>(null); 

  useEffect(() => {
    // Set initial value after hydration
    setIsMobile(window.innerWidth < breakpoint);

    const handleResize = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [breakpoint]);

  // Return false during hydration, then the actual value
  return isMobile === null ? false : isMobile;
};

export default useIsMobile;