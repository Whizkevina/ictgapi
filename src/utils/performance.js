import { useEffect } from 'react';

// Performance optimization hook
export const usePerformanceOptimizations = () => {
  useEffect(() => {
    // Preload critical resources
    const preloadCriticalResources = () => {
      // Preload fonts
      const fontPreloads = [
        'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
        'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap'
      ];

      fontPreloads.forEach(url => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'style';
        link.href = url;
        document.head.appendChild(link);
      });
    };

    // Optimize images
    const optimizeImages = () => {
      const images = document.querySelectorAll('img');
      images.forEach(img => {
        if (!img.loading) {
          img.loading = 'lazy';
        }
        if (!img.decoding) {
          img.decoding = 'async';
        }
      });
    };

    // Enable hardware acceleration for animations
    const enableHardwareAcceleration = () => {
      const animatedElements = document.querySelectorAll('.animate-fade-in, .animate-slide-up, .animate-bounce');
      animatedElements.forEach(el => {
        el.style.transform = 'translateZ(0)';
        el.style.backfaceVisibility = 'hidden';
        el.style.perspective = '1000px';
      });
    };

    // Run optimizations
    preloadCriticalResources();
    optimizeImages();
    enableHardwareAcceleration();

    // Clean up on unmount
    return () => {
      // Remove preload links if needed
    };
  }, []);
};

// Component for critical CSS
export const CriticalCSS = () => {
  useEffect(() => {
    // Inject critical CSS for above-the-fold content
    const criticalCSS = `
      .hero-section {
        background: linear-gradient(135deg, #000 0%, #800000 50%, #000 100%);
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .hero-title {
        font-size: clamp(2rem, 8vw, 5rem);
        background: linear-gradient(45deg, #fff, #ffd700, #fff);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
    `;

    const style = document.createElement('style');
    style.innerHTML = criticalCSS;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return null;
};

const performanceUtils = { usePerformanceOptimizations, CriticalCSS };
export default performanceUtils;
