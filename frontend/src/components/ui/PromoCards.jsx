import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import couponApi from '../../services/couponApi';
const imgPath = '/assets/images/coupon.avif';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.12 } } };
const card = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } } };

const PromoCards = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const list = await couponApi.list();
        // Map backend coupons to display model
        const mapped = (list || []).map((c) => {
          const isActive = !!c.active && (!c.startDate || new Date(c.startDate) <= new Date()) && (!c.endDate || new Date(c.endDate) >= new Date());
          const title = `Use Code: ${c.code}`;
          const min = typeof c.minSubtotal === 'number' ? c.minSubtotal : 0;
          const valueText = c.discountType === 'FIXED' ? `₹${c.value}` : `${c.value}%`;
          const scope = [c.applicableCategory, c.applicableSubcategory].filter(Boolean).join(' ');
          const subtitle = c.description
            || (c.discountType === 'FIXED' 
                ? `Get ${valueText} OFF${min ? ` above ₹${min}` : ''}${scope ? ` on ${scope}` : ''}`
                : `Get Flat ${valueText} OFF${min ? ` above ₹${min}` : ''}${scope ? ` on ${scope}` : ''}`);
          return {
            id: c.id || c.code,
            title,
            subtitle,
            img: imgPath,
            isActive
          };
        });
        if (mounted) setCoupons(mapped);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);
  return (
    <motion.section className="container mx-auto px-4 py-8" initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }} variants={container}>
      {/* Continuous auto-scrolling promo row (pure CSS) */}
      <style>{`
        :root{ --promo-gap: 1rem; --promo-speed: 26s; --promo-card-minw: 320px; }
        .promo-scroll { width:100%; overflow:hidden; }
        .promo-scroll__scroller { display:flex; gap:var(--promo-gap); align-items:center; width:max-content; animation:promo-scroll var(--promo-speed) linear infinite; }
        .promo-scroll__group { display:flex; gap:var(--promo-gap); align-items:center; flex-shrink:0; }
        .promo-card { flex:0 0 auto; min-width:var(--promo-card-minw); }
        @keyframes promo-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @media (max-width:640px){ :root{ --promo-speed:20s; --promo-card-minw:260px } }
        @media (prefers-reduced-motion: reduce){ .promo-scroll__scroller{ animation:none } }
      `}</style>

      <div className="promo-scroll py-4">
        <div className="promo-scroll__scroller">
          <div className="promo-scroll__group">
            {(loading ? [] : coupons).map((p) => (
              <motion.article key={`a-${p.id}`} variants={card} whileHover={{ scale: 1.02, translateY: -4 }} className="promo-card flex items-center gap-4 bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200 border-2 border-orange-200" style={{ borderColor: '#ffd6c4' }}>
                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-white border border-orange-100 shrink-0">
                  <img src={p.img} alt={p.title} className="w-12 h-12 object-contain" />
                </div>
                <div className="flex-1">
                  <h3 className={`text-sm font-semibold ${p.isActive ? 'text-emerald-700' : 'text-muted-foreground'}`}>{p.title}</h3>
                  <p className={`text-xs mt-1 ${p.isActive ? 'text-emerald-600' : 'text-muted-foreground'}`}>{p.subtitle}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="px-3 py-2 text-sm rounded-md border border-border bg-white hover:bg-muted/20 transition-colors"
                    onClick={() => {
                      const code = (p.title.split(':')[1] || '').trim();
                      if (navigator.clipboard?.writeText) {
                        navigator.clipboard.writeText(code).then(() => {
                          setCopiedId(p.id);
                          setTimeout(() => setCopiedId(null), 1500);
                        }).catch(() => {
                          setCopiedId(p.id);
                          setTimeout(() => setCopiedId(null), 1500);
                        });
                      } else {
                        setCopiedId(p.id);
                        setTimeout(() => setCopiedId(null), 1500);
                      }
                    }}
                    aria-label={`Copy ${p.title} code`}
                  >
                    Copy
                  </button>
                  {copiedId === p.id && (
                    <span className="text-xs text-emerald-700">Code copied!</span>
                  )}
                </div>
              </motion.article>
            ))}
          </div>

          <div className="promo-scroll__group" aria-hidden="true">
            {(loading ? [] : coupons).map((p) => (
              <motion.article key={`b-${p.id}`} variants={card} whileHover={{ scale: 1.02, translateY: -4 }} className="promo-card flex items-center gap-4 bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200 border-2 border-orange-200" style={{ borderColor: '#ffd6c4' }}>
                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-white border border-orange-100 shrink-0">
                  <img src={p.img} alt={p.title} className="w-12 h-12 object-contain" />
                </div>
                <div className="flex-1">
                  <h3 className={`text-sm font-semibold ${p.isActive ? 'text-emerald-700' : 'text-muted-foreground'}`}>{p.title}</h3>
                  <p className={`text-xs mt-1 ${p.isActive ? 'text-emerald-600' : 'text-muted-foreground'}`}>{p.subtitle}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="px-3 py-2 text-sm rounded-md border border-border bg-white hover:bg-muted/20 transition-colors"
                    onClick={() => {
                      const code = (p.title.split(':')[1] || '').trim();
                      if (navigator.clipboard?.writeText) {
                        navigator.clipboard.writeText(code).then(() => {
                          setCopiedId(p.id);
                          setTimeout(() => setCopiedId(null), 1500);
                        }).catch(() => {
                          setCopiedId(p.id);
                          setTimeout(() => setCopiedId(null), 1500);
                        });
                      } else {
                        setCopiedId(p.id);
                        setTimeout(() => setCopiedId(null), 1500);
                      }
                    }}
                    aria-label={`Copy ${p.title} code`}
                  >
                    Copy
                  </button>
                  {copiedId === p.id && (
                    <span className="text-xs text-emerald-700">Code copied!</span>
                  )}
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </div>

    </motion.section>
  );
};

export default PromoCards;
