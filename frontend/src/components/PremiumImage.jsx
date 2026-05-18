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
        let finalUrl = await fetchSingleImage(event, destination, dayTheme);
        
        // Strip existing &w or &q and inject adaptive quality if Unsplash
        if (finalUrl && finalUrl.includes('unsplash.com')) {
          finalUrl = finalUrl.split('&w=')[0] + getQualityParams();
        }

        if (isMounted) {
          setSrc(finalUrl || getFallbackImage(event?.category));
          // Note: we don't set status to 'success' until the actual <img> onLoad fires
        }
      } catch (err) {
        if (isMounted) {
          setSrc(getFallbackImage(event?.category));
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
    setSrc(getFallbackImage(event?.category));
  };

  const lowEndClass = isLowEnd() ? 'pi-low-end' : '';

  return (
    <div 
      ref={containerRef} 
      className={`premium-image-container ${className}`} 
      style={{ aspectRatio }}
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
          className={`premium-image-reveal ${status === 'success' ? 'is-loaded' : ''} ${lowEndClass}`}
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
