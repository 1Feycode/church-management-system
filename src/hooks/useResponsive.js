import { useState, useEffect } from 'react'

// Breakpoints
// mobile:  < 640px
// tablet:  640px – 1024px
// desktop: > 1024px

export function useResponsive() {
  const [width, setWidth] = useState(() => window.innerWidth)

  useEffect(() => {
    function onResize() { setWidth(window.innerWidth) }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return {
    width,
    isMobile: width < 640,
    isTablet: width >= 640 && width < 1024,
    isDesktop: width >= 1024,
    isSmall: width < 1024   // mobile OR tablet
  }
}
