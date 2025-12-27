import React from 'react';
import HeroSlider from '../../../components/ui/HeroSlider';

const HeroSection = () => {
  // This component now delegates rendering to the shared HeroSlider component.
  // Keeping the wrapper allows any page-level spacing or background to be applied here
  // if needed later.
  return (
    <section className="relative overflow-hidden">
      <HeroSlider />
    </section>
  );
};

export default HeroSection;