import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';

const Footer = () => {
  const currentYear = new Date()?.getFullYear();

  const popularSearches = [
    "Collars Leashes & Harnesses", "Dog Food", "Treats,Biscuits and Chews", "royal Canin",
    "Name Tags", "Harnesses", "Beds", "Dog Toys", "Dog Grooming", "Dog Shampoo",
    "Dog Clothes", "Dog Accessories", "Dry Dog Food", "Collars and Leashes", "Dog Crates",
    "Puppy Food", "Dog Vitamins", "Flea and Tick Control", "Dog Dental Care", "Dog Training Pads",
    "Grain Free Dog Food", "Dog Bowls and Feeders", "Organic Dog Food", "Hypoallergenic Dog Food"
  ];

  const footerLinks = {
    company: [
      { label: "About Us", path: "/about" },
      { label: "Our Story", path: "/our-story" },
      { label: "Blog", path: "/blog" },
      { label: "Careers", path: "/careers" }
    ],
    customer: [
      { label: "My Account", path: "/user-account-dashboard" },
      { label: "Order History", path: "/user-account-dashboard?tab=orders" },
      { label: "Track Order", path: "/track-order" },
      { label: "Help & Support", path: "/support" }
    ],
    policies: [
      { label: "Shipping Policy", path: "/shipping-policy" },
      { label: "Return Policy", path: "/return-policy" },
      { label: "Privacy Policy", path: "/privacy-policy" },
      { label: "Terms of Service", path: "/terms-of-service" }
    ]
  };

  const features = [
    { title: 'By creating innovative products & services', link: 'Explore PET&CO Innovations', icon: 'Rocket' },
    { title: 'By becoming your pet-parenting partners', link: 'Follow us on instagram', icon: 'Shield' },
    { title: 'By building the foundation for a kinder world', link: 'View PET&CO Foundation Initiatives', icon: 'Home' },
    { title: 'By helping animals in need with every order', link: 'Feed A Dog In Need', icon: 'Heart' },
    { title: 'By fostering a community for animal enthusiasts', link: 'Join PET&CO Tribe', icon: 'MessageCircle' }
  ];

  const socialLinks = [
    { name: "Facebook", icon: "Facebook", url: "https://www.facebook.com/profile.php?id=61581179697955" },
    { name: "Instagram", icon: "Instagram", url: "https://www.instagram.com/root_straditional/" },
    { name: "YouTube", icon: "Youtube", url: "https://www.youtube.com/@rootstraditionalfoods" }
  ];

  const contactInfo = {
    phone: "9845651468",
    whatsapp: "+91 9845651468",
    email: "hello@neenusnatural.com",
    address: "123 MG Road, Bengaluru, Karnataka 560001"
  };

  const paymentLogos = [
    'PayPal.png',
    'RuPay.png',
    'UPI.png',
    'visa.jpeg',
    'American Express.png',
    'Cash_On_Delivery.png',
    'Mastercard.png',
    'NetBanking.png'
  ];

  return (
    <footer className="bg-[#071322] text-white">
      {/* Features row (5 icons) */}
      <div className="border-b border-[#0f2230]">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 items-start">
            {features.map((f, idx) => (
              <div key={idx} className="flex flex-col items-center text-center px-4">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mb-3">
                  <Icon name={f.icon} size={18} color="white" />
                </div>
                <div className="font-semibold text-sm max-w-[220px]">{f.title}</div>
                <a href="#" className="mt-2 text-xs text-gray-200 underline">{f.link}</a>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Announcement banner */}
      <div className="border-b border-[#0f2230]">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <div className="w-16 opacity-90">
            <Icon name="Award" size={36} color="white" />
          </div>
          <div className="flex-1 text-center px-6 text-sm text-gray-200">
            We’re truly honoured to announce that PE T&CO has been crowned with World Branding Award: Brand Of The Year for an unprecedented fifth year in a row, and World Branding Award: Treats Of The Year. Thank you for returning our love for pets with more love, trust, and support.
          </div>
          <div className="w-16 opacity-90 text-right">
            <Icon name="Award" size={36} color="white" />
          </div>
        </div>
      </div>

      {/* Main five-column footer */}
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Shop by Pet */}
          <div>
            <h5 className="font-semibold mb-4">Shop by Pet</h5>
            <ul className="space-y-2 text-sm text-gray-200">
              <li>Dogs</li>
              <li>Cats</li>
              <li>Puppies</li>
              <li>Kittens</li>
              <li>Small Animals</li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h5 className="font-semibold mb-4">Customer Care</h5>
            <ul className="space-y-2 text-sm text-gray-200">
              <li>Contact Us</li>
              <li>FAQs & Exchange Policy</li>
              <li>Terms Of Use</li>
              <li>Privacy Policy</li>
              <li>Franchise</li>
            </ul>
          </div>

          {/* House of PET&CO */}
          <div>
            <h5 className="font-semibold mb-4">House of PET&CO</h5>
            <ul className="space-y-2 text-sm text-gray-200">
              <li>Sara's</li>
              <li>Sara's Treats</li>
              <li>Meowsi</li>
              <li>Hearty</li>
              <li>Dashdog</li>
            </ul>
          </div>

          {/* The World of PET&CO */}
          <div className="md:col-span-1">
            <h5 className="font-semibold mb-4">The World of PET&CO</h5>
            <ul className="space-y-2 text-sm text-gray-200">
              <li>About Us</li>
              <li>Careers</li>
              <li>Awards</li>
              <li>Store Locator</li>
              <li>PET&CO Spa</li>
              <li>Birthday Club</li>
              <li>PET&CO Foundation</li>
              <li>Customer Love</li>
              <li>Community</li>
              <li>PET&CO Blog</li>
            </ul>
          </div>

          {/* Newsletter / Join the PET&CO Family */}
          <div>
            <h5 className="font-semibold mb-4">Join the PET&CO Family</h5>
            <p className="text-sm text-gray-300 mb-4">Subscribe to our newsletter for pet care tips, new arrivals, exclusive offers, and more!</p>
            <form className="flex flex-col space-y-3">
              <input type="email" placeholder="Your Email Address" className="px-4 py-3 rounded-md bg-[#0b1620] placeholder:text-gray-500 text-sm border border-transparent focus:border-orange-400 outline-none" />
              <button type="submit" className="px-4 py-3 bg-orange-500 text-white rounded-md font-semibold">Subscribe</button>
            </form>
          </div>
        </div>
      </div>

      {/* Four info boxes (below main columns) */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-[#0b1620] p-6 rounded">
            <h3 className="text-center font-semibold text-lg">Free Shipping</h3>
            <p className="text-center text-sm text-orange-500 mt-2">On all orders above ₹699</p>
          </div>
          <div className="bg-[#0b1620] p-6 rounded">
            <h3 className="text-center font-semibold text-lg">Free Returns</h3>
            <p className="text-center text-sm text-orange-500 mt-2">Within 7 days (T&Cs Apply)</p>
          </div>
          <div className="bg-[#0b1620] p-6 rounded">
            <h3 className="text-center font-semibold text-lg">BEST DEALS</h3>
            <p className="text-center text-sm text-orange-500 mt-2">On pet care products</p>
          </div>
          <div className="bg-[#0b1620] p-6 rounded">
            <h3 className="text-center font-semibold text-lg">CUSTOMER CARE</h3>
            <p className="text-center text-sm text-orange-500 mt-2">Mon–Sat, 9AM–9PM</p>
          </div>
        </div>
      </div>

      {/* Popular Searches and Shop by Breed */}
      <div className="border-t border-[#0f2230]">
        <div className="container mx-auto px-4 py-8">
          <h4 className="font-semibold mb-4">Popular Searches</h4>
          <div className="text-sm text-gray-300 leading-relaxed">
            {popularSearches.join(' | ')}
          </div>

          <div className="mt-6">
            <h4 className="font-semibold mb-3">Shop by Breed</h4>
            <div className="text-sm text-gray-300">
              German Shepherd | Shih Tzu | Labrador Retriever | Beagle | Husky | Golden Retriever | Pug | Indies
            </div>
          </div>
        </div>
      </div>

      {/* Address / App download / Social */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div>
            <h5 className="font-semibold mb-2">Head Office Address</h5>
            <div className="text-sm text-gray-300">
              8, 1st Main road, 12th Cross Rd, Pai Layout, Mahadevapura, Bengaluru, Karnataka 560016
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="flex flex-wrap items-center justify-center gap-4">
              {paymentLogos.map((file) => (
                <img
                  key={file}
                  src={encodeURI(`/assets/images/payment logo/${file}`)}
                  alt={file.replace(/\.[^.]+$/, '')}
                  className="h-10 object-contain bg-white rounded-md p-1"
                />
              ))}
            </div>
          </div>

          <div className="text-right">
            <h5 className="font-semibold mb-3">Follow us on</h5>
            <div className="flex items-center justify-end space-x-3">
              {socialLinks.map((s, i) => (
                <a key={i} href={s.url} target="_blank" rel="noreferrer" className="w-8 h-8 bg-[#0b1620] rounded flex items-center justify-center">
                  <Icon name={s.icon} size={14} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Orange copyright bar */}
      <div className="bg-orange-500">
        <div className="container mx-auto px-4 py-3 text-center text-white text-sm">
          © {currentYear}, Pet & Co Private Limited. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;