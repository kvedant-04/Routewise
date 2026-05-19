import React, { useState, useEffect, useRef } from 'react';
import { fetchSingleImage, getFallbackImage } from '../utils/mediaEngine';

/**
 * PremiumImage (Phase 13.X)
 * Decentralized, progressively enhanced media component built to Stitch AI standards.
 * Features:
 * - IntersectionObserver lazy-loading (300px rootMargin)
 * - True shimmer skeleton preservation (0 CLS)
 * - GPU-safe opacity/transform reveals
 * - Connection-aware sizing & Low-end device safety
 * - DOM recycling safety (memoized hydration)
 */
const PremiumImage = React.memo(({
  event,
  destination,
  dayTheme = '',
  priority = false, // If true, skips observer and loads instantly (Tier 1)
  alt,
  className = '',
  aspectRatio = '16/9', // default geometric lock
  isModal = false,      // Used to trigger high-res upgrade logic if needed
}) => {
  const [status, setStatus] = useState(priority ? 'loading' : 'idle');
  const [src, setSrc] = useState(null);
  const [meta, setMeta] = useState({ orientation: 'landscape', width: 1200, height: 800 });
  const containerRef = useRef(null);
  const observerRef = useRef(null);

  // Device capabilities detection
  const isLowEnd = () => {
    if (typeof window === 'undefined') return false;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const lowMemory = navigator.deviceMemory && navigator.deviceMemory <= 4;
    return reducedMotion || lowMemory;
  };

  const getQualityParams = () => {
    if (typeof navigator === 'undefined' || !navigator.connection) return '&w=900&q=80';
    const conn = navigator.connection;
    if (conn.saveData || conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g' || conn.effectiveType === '3g') {
      return '&w=600&q=65'; // Adaptive medium-quality
    }
    return '&w=1200&q=85'; // Full-quality
  };

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      if (status !== 'idle' && status !== 'loading') return;
      setStatus('loading');
      
      try {
        let result = await fetchSingleImage(event, destination, dayTheme);
        
        // Strip existing &w or &q and inject adaptive quality if Unsplash
        if (result && result.url && result.url.includes('unsplash.com')) {
          result.url = result.url.split('&w=')[0] + getQualityParams();
        }

        if (isMounted) {
          if (result && result.url) {
            setSrc(result.url);
            setMeta({ orientation: result.orientation, width: result.width, height: result.height });
          } else {
            const fallback = getFallbackImage(event?.category);
            setSrc(fallback.url);
            setMeta({ orientation: fallback.orientation, width: fallback.width, height: fallback.height });
          }
        }
      } catch (err) {
        if (isMounted) {
          const fallback = getFallbackImage(event?.category);
          setSrc(fallback.url);
          setMeta({ orientation: fallback.orientation, width: fallback.width, height: fallback.height });
        }
      }
    };

    // Tier 1: Immediate hydration
    if (priority) {
      load();
      return;
    }

    // Tier 2/3: Lazy hydration via IntersectionObserver
    if (!observerRef.current) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            load();
            if (observerRef.current && containerRef.current) {
              observerRef.current.unobserve(containerRef.current);
            }
          }
        },
        { rootMargin: '300px' } // Preload just before viewport entry
      );
    }

    if (containerRef.current) {
      observerRef.current.observe(containerRef.current);
    }

    return () => {
      isMounted = false;
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [event, destination, dayTheme, priority]);

  // Handle actual image load completion
  const handleLoad = () => setStatus('success');
  const handleError = () => {
    setStatus('error');
    const fallback = getFallbackImage(event?.category);
    setSrc(fallback.url);
    setMeta({ orientation: fallback.orientation, width: fallback.width, height: fallback.height });
  };

  const lowEndClass = isLowEnd() ? 'pi-low-end' : '';

  // Compute dynamic bounded aspect ratio if the prop is "auto" or metadata-driven
  const computedRatio = aspectRatio === 'auto' 
    ? (meta.width && meta.height ? `${meta.width} / ${meta.height}` : '16/9') 
    : aspectRatio;
    
  const isPortrait = meta.orientation === 'portrait';
  const ratio = meta.width && meta.height ? meta.width / meta.height : 1.77;
  const isPanorama = ratio >= 2.1;

  let orientationClass = 'is-landscape';
  if (isPortrait) {
    orientationClass = 'is-portrait';
  } else if (isPanorama) {
    orientationClass = 'is-panorama';
  }

  return (
    <div 
      ref={containerRef} 
      className={`premium-image-container ${className} ${orientationClass}`} 
      style={{ aspectRatio: computedRatio }}
    >
      {/* Skeleton Layer */}
      {status !== 'success' && (
        <div className="premium-shimmer" aria-hidden="true" />
      )}

      {/* Actual Image */}
      {src && (
        <img
          src={src}
          alt={alt || event?.activity || 'Activity Image'}
          className={`premium-image-reveal ${status === 'success' ? 'is-loaded' : ''} ${lowEndClass} ${orientationClass}`}
          onLoad={handleLoad}
          onError={handleError}
          decoding="async" // Anti-jank decoding
        />
      )}
      
      {/* Failure Blur Recovery */}
      {status === 'error' && (
        <div className="premium-error-fallback" />
      )}
    </div>
  );
});

export default PremiumImage;
