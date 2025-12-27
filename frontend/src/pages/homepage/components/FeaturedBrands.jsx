import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import DecryptedText from './DecryptedText';
import FranchiseBanner from './FranchiseBanner';

const brands = [
  { name: 'Pro Plan', img: 'proplan.png', type: 'dog', badge: 'UP TO 18% Off', cta: 'Limited Offer' },
  { name: 'Royal Canin', img: 'royal canin.png', type: 'dog', badge: 'FLAT 15% Off', cta: 'Use: HRC3' },
  { name: 'Whiskas', img: 'whiskas.png', type: 'cat', badge: 'UP TO 18% Off', cta: 'Limited Offer' },
  { name: 'Kennel Kitchen', img: 'kennel kirchen.png', type: 'cat', badge: 'UP TO 10% Off', cta: 'Limited Offer' },
  { name: 'Matisse', img: 'matisse.png', type: 'cat', badge: '+ ₹500 OFF', cta: 'Limited Offer' },
  { name: 'Me-O', img: 'meo.png', type: 'cat', badge: 'FLAT 15% Off', cta: 'Use: MEO15' },
  { name: 'NutriWag', img: 'nutriwag.png', type: 'dog', badge: 'UP TO 10% Off', cta: 'Limited Offer' },
  { name: 'Pedigree', img: 'pedigree.png', type: 'dog', badge: 'FLAT 15% Off', cta: 'Use: PEDIGREE' }
];

const toSlug = (s) => (s || '')
  .toLowerCase()
  .replace(/&/g, 'and')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

const FeaturedBrands = () => {
  return (
    <section className="py-8 lg:py-12 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl lg:text-4xl font-heading font-bold mb-6 text-foreground">Big Brands, Bigger Deals!</h2>
        <p className="text-lg text-muted-foreground mb-6">Find them all at PET&CO</p>

        {/* grid: 2 rows x 4 cols on md+ (responsive) */}
        <div className="-mx-4 px-4 lg:mx-0 lg:px-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
            {brands.map((b, i) => {
              const src = `/assets/images/branding/${encodeURIComponent(b.img)}`;
              const slug = toSlug(b.name);
              const to = b.type === 'cat'
                ? `/shop-for-cats?category=cat-food&brand=${encodeURIComponent(b.name)}`
                : `/shop-for-dogs?category=dogfood&brand=${encodeURIComponent(b.name)}`;
              return (
                <article
                  key={i}
                  className="relative rounded-2xl overflow-hidden bg-white shadow-sm"
                  style={{ borderRadius: '14px' }}
                >
                  {/* Image area - fill the tile so there are no gaps; parent has rounded corners and overflow-hidden */}
                  <Link to={to} className="block w-full aspect-[3/4]">
                    <img src={src} alt={b.name} className="w-full h-full object-cover block" />
                  </Link>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

const BirthdayClubBanner = () => {
  const { ref, inView } = useInView();

  return (
    <section ref={ref} className="py-8 lg:py-12 bg-blue-100 rounded-lg">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="rounded-lg shadow-lg overflow-hidden bg-white p-6 flex items-center justify-between"
        >
          <div className="flex-1">
            <DecryptedText
              text="Your Pet's Birthday?"
              speed={100}
              maxIterations={20}
              characters="ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!?"
              className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2"
            />
            <DecryptedText
              text="Join PET&CO Birthday Club & Get FLAT 15% OFF!"
              speed={80}
              maxIterations={15}
              characters="ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!?"
              className="text-lg text-gray-600"
            />
          </div>
          <motion.img
            src="/assets/images/essential/dog_birthday.jpg"
            alt="Birthday Club"
            className="w-40 h-40 object-contain rounded-full border-4 border-blue-300"
            initial={{ scale: 0.8 }}
            animate={inView ? { scale: 1 } : { scale: 0.8 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />
        </motion.div>
      </div>
    </section>
  );
};

const DecodingCatsSection = () => {
  const catItems = [
    {
      img: '/assets/images/essential/cat wet food.png',
      title: 'Cat Food',
    },
    {
      img: '/assets/images/essential/cat dry food.png',
      title: 'Cat Toys',
    },
    {
      img: '/assets/images/essential/cat litter.png',
      title: 'Cat Litter',
    },
    {
      img: '/assets/images/essential/cat carriers.png',
      title: 'Cat Treats',
    },
  ];

  const toPath = (title) => {
    switch (title) {
      case 'Cat Food':
        return '/shop-for-cats/cat-food?sub=All%20Cat%20Food';
      case 'Cat Toys':
        return '/shop-for-cats/cat-toys';
      case 'Cat Litter':
        return '/shop-for-cats/cat-litter';
      case 'Cat Treats':
        return '/shop-for-cats/cat-treats';
      default:
        return '/shop-for-cats';
    }
  };

  return (
    <section className="py-8 lg:py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl lg:text-4xl font-heading font-bold mb-6 text-foreground">Decoding Cats 101</h2>
        <p className="text-lg text-muted-foreground mb-6">Your cat knows what they want, do you?</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {catItems.map((item, index) => (
            <div key={index} className="text-center">
              <Link to={toPath(item.title)} className="block">
                <div className="relative rounded-lg overflow-hidden shadow-md">
                  <img
                    src={item.img}
                    alt={item.title}
                    className="w-full h-auto object-cover block rounded-lg"
                  />
                </div>
                <h3 className="mt-4 text-lg font-medium text-foreground">{item.title}</h3>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Export sub-sections so pages can compose them in different orders
export { BirthdayClubBanner, DecodingCatsSection, FranchiseBanner };
export default FeaturedBrands;
