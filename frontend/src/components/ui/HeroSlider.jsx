import React, { useEffect, useRef, useState } from 'react';

const slides = [
  {
    src: '/assets/images/banners/d1.png',
    // Mobile-specific banner (used on small viewports)
    mobileSrc: '/assets/images/banners/2.png',
    fit: 'contain',
    position: 'center',
    maxWidth: '1000px'
  },
  {
    src: '/assets/images/banners/d2.png',
    mobileSrc: '/assets/images/banners/1.png',
    fit: 'contain',
    position: 'right center',
    maxWidth: '1000px'
  },
  {
    src: '/assets/images/banners/d3.png',
    mobileSrc: '/assets/images/banners/3.png',
    fit: 'contain',
    position: 'center',
    maxWidth: '1000px'
  },
];

const HeroSlider = ({ interval = 4000, transition = 1000 }) => {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);
  const containerRef = useRef(null);
  const [isMobile, setIsMobile] = useState(() => (typeof window !== 'undefined' ? window.innerWidth <= 767 : false));
  const [headerHeight, setHeaderHeight] = useState(0);

  useEffect(() => {
    startAutoPlay();
    return () => stopAutoPlay();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, isPaused]);

  // track small viewport (mobile) so we can swap to mobile-specific banners
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(max-width: 767px)');
    const onChange = () => setIsMobile(mq.matches);
    onChange();
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else mq.addListener(onChange);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', onChange);
      else mq.removeListener(onChange);
    };
  }, []);

  // measure header height (so hero can fit within visible viewport below fixed header)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const updateHeader = () => {
      const el = document.getElementById('site-header');
      const h = el ? el.offsetHeight : 0;
      setHeaderHeight(h);
    };
    updateHeader();
    window.addEventListener('resize', updateHeader);
    // occasionally header height may change (e.g., announcement bar toggles) — listen to orientation change
    window.addEventListener('orientationchange', updateHeader);
    return () => {
      window.removeEventListener('resize', updateHeader);
      window.removeEventListener('orientationchange', updateHeader);
    };
  }, []);

  function startAutoPlay() {
    if (timerRef.current) return;
    if (isPaused) return;
    timerRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, interval);
  }

  function stopAutoPlay() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  function goTo(i) {
    stopAutoPlay();
    setIndex(i);
    // restart after short delay so users can see the chosen slide
    setTimeout(() => {
      stopAutoPlay();
      timerRef.current = null;
      if (!isPaused) startAutoPlay();
    }, 50);
  }

  function prev() {
    stopAutoPlay();
    setIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }

  function next() {
    stopAutoPlay();
    setIndex((prev) => (prev + 1) % slides.length);
  }

  // pause on hover
  function handleMouseEnter() {
    setIsPaused(true);
    stopAutoPlay();
  }

  function handleMouseLeave() {
    setIsPaused(false);
    // small timeout to avoid instant jump
    setTimeout(() => {
      startAutoPlay();
    }, 120);
  }

  // keyboard support
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    }
    const el = containerRef.current || window;
    el.addEventListener('keydown', onKey);
    return () => el.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full max-w-full overflow-hidden ${isMobile ? 'px-0' : 'mx-0 px-0 hero-1920'}`}
      style={{
        height: isMobile ? '240px' : (headerHeight ? `calc(100vh - ${headerHeight}px)` : '100vh'),
        ...(isMobile ? {} : {
          // avoid using 100vw (includes scrollbar width) which can create horizontal overflow
          // use full width of the containing layout instead
          position: 'relative',
          left: 0,
          transform: 'none',
          width: '100%',
          maxWidth: '100%'
        })
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      tabIndex={0}
      aria-roledescription="carousel"
      aria-label="Homepage banners"
    >
      {/* Inline styles for keyframes and small helpers */}
      <style>{`
        @keyframes ksKenBurns {
          0% { transform: scale(1) translateZ(0); }
          100% { transform: scale(1.03) translateZ(0); }
        }
      `}</style>

      {slides.map((s, i) => {
        const active = i === index;
        return (
          <div
            key={i}
            className={`absolute inset-0 ease-in-out`}
            style={{
              opacity: active ? 1 : 0,
              zIndex: active ? 10 : 1,
              transitionProperty: 'opacity',
              transitionDuration: `${transition}ms`,
            }}
            aria-hidden={!active}
          >
            {/* Full-bleed background layer to avoid side gaps/padding. Using background-size: cover
                ensures the banner fills the entire hero area without white gutters. Ken-burns
                animation is applied to the inner layer via transform scale.
            */}
            <div className="w-full h-full flex items-center justify-center">
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: isMobile ? 12 : 0,
                  overflow: 'hidden',
                  boxShadow: isMobile ? '0 6px 18px rgba(0,0,0,0.08)' : undefined,
                }}
              >
                <div className={`w-full h-full flex ${isMobile ? 'items-start' : 'items-center'} justify-center`} style={{ backgroundColor: '#fafafa' }}>
                  <img
                    src={encodeURI(isMobile && s.mobileSrc ? s.mobileSrc : s.src)}
                    alt={s.alt || ''}
                    className="block"
                    style={{
                      display: 'block',
                      width: '100%',
                      // On mobile we want a fixed hero height so the banner fills horizontally
                      // without being compressed — use a fixed height and cover to fill.
                      height: isMobile ? '240px' : '100%',
                      maxWidth: 'none',
                      maxHeight: isMobile ? '240px' : (headerHeight ? `calc(100vh - ${headerHeight}px)` : '100vh'),
                      objectFit: 'cover',
                      objectPosition: isMobile ? 'top center' : 'center center',
                      transformOrigin: 'center center',
                      transition: `opacity ${transition}ms ease-in-out`,
                      transform: 'scale(1)'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Prev / Next buttons */}
      <button
        onClick={prev}
        aria-label="Previous slide"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white p-2 rounded-full shadow-md"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={next}
        aria-label="Next slide"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white p-2 rounded-full shadow-md"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Dots */}
      {/* <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            aria-label={`Go to slide ${i + 1}`}
            className={`w-3 h-3 rounded-full transition-all ${i === index ? 'bg-white' : 'bg-white/50'}`}
            onClick={() => goTo(i)}
          />
        ))}
      </div> */}
    </div>
  );
};

export default HeroSlider;
 

