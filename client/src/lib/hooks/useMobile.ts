import { useState, useEffect } from 'react';

export function useMobile(breakpoint = 1024) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < breakpoint : false
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    window.addEventListener('resize', checkScreenSize);
    
    // Initial check
    checkScreenSize();

    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, [breakpoint]);

  return isMobile;
}

export default useMobile;
