import React, { useEffect, useRef } from 'react';

function Image({
  src,
  alt = "Image Name",
  className = "",
  ...props
}) {
  // Track when we started loading the current src so we can measure load duration
  const startRef = useRef(null);
  const { onLoad: userOnLoad, onError: userOnError, ...rest } = props;

  useEffect(() => {
    // reset start time when src changes
    startRef.current = typeof performance !== 'undefined' ? performance.now() : Date.now();
  }, [src]);

  const handleLoad = (e) => {
    try {
      const end = typeof performance !== 'undefined' ? performance.now() : Date.now();
      const duration = startRef.current ? Math.round(end - startRef.current) : null;
      if (import.meta?.env?.MODE !== 'production') {
        // Lightweight debug info to help diagnose slow loads (only in non-prod)
        // eslint-disable-next-line no-console
        console.log('AppImage: loaded', { src, duration });
      }
    } catch (err) {
      // swallow
    }
    if (typeof userOnLoad === 'function') userOnLoad(e);
  };

  const handleError = (e) => {
    // Fallback image when the resource fails to load
    try {
      e.target.src = '/assets/images/no_image.png';
    } catch (_) {}
    if (typeof userOnError === 'function') userOnError(e);
  };

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onLoad={handleLoad}
      onError={handleError}
      {...rest}
    />
  );
}

export default Image;
