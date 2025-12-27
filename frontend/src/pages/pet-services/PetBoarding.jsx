import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import Footer from '../homepage/components/Footer';
import MobileBottomNav from '../../components/ui/MobileBottomNav';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import BookingForm from './components/BookingForm';
import BoardingPlanCard from './components/BoardingPlanCard';
import AppImage from '../../components/AppImage';

const PetBoardingPage = () => {
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const defaultService = {
    name: 'Pet Boarding',
    serviceType: 'pet-boarding',
    price: 799,
    duration: '24 hours',
    petType: 'dog',
  };

  return (
    <>
      <Helmet>
        <title>Pet Boarding | PET&CO</title>
        <meta name="description" content="Safe and comfortable overnight pet boarding with supervised care, meals, and playtime." />
      </Helmet>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-10">
          {/* Hero */}
          <div className="mb-6">
            <div className="flex items-center gap-3">
              <Icon name="Home" size={28} className="text-primary" />
              <h1 className="text-3xl font-heading font-bold text-foreground">Pet Boarding</h1>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Safe, clean, and comfortable stay with supervised care, meals, and playtime.
            </p>
          </div>

          {/* Service Cost Heading */}
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-heading font-bold">
              <span className="text-primary">Service</span> <span className="text-foreground">Cost</span>
            </h2>
            <p className="text-muted-foreground mt-2">Explore our pet boarding service packages</p>
            <p className="text-sm text-muted-foreground">Table shows charges per pet</p>
          </div>

          {/* Plans */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <BoardingPlanCard
              title="Dog Boarding Plans"
              imageSrc="/assets/images/dog/dg1.webp"
              petType="dog"
              plans={[
                { name: 'Hourly', subtitle: 'Upto 4 hours', price: 599, petType: 'dog', duration: 'Up to 4 hours' },
                { name: 'Daycare', subtitle: 'Upto 10 hours', price: 799, petType: 'dog', duration: 'Up to 10 hours' },
                { name: 'Overnight', subtitle: 'Upto 24 hours', price: 899, petType: 'dog', duration: 'Up to 24 hours' },
              ]}
              onSelectPlan={(p) => {
                setSelectedPlan({
                  name: `${p.petType === 'cat' ? 'Cat' : 'Dog'} Boarding - ${p.name}`,
                  serviceType: `${p.petType}-boarding`,
                  price: p.price,
                  duration: p.duration,
                  petType: p.petType,
                });
                setShowBookingForm(true);
              }}
            />

            <BoardingPlanCard
              title="Cat Boarding Plans"
              imageSrc="/assets/images/cat/ct1.webp"
              petType="cat"
              plans={[
                { name: 'Hourly', subtitle: 'Upto 4 hours', price: 499, petType: 'cat', duration: 'Up to 4 hours' },
                { name: 'Daycare', subtitle: 'Upto 10 hours', price: 599, petType: 'cat', duration: 'Up to 10 hours' },
                { name: 'Overnight', subtitle: 'Upto 24 hours', price: 649, petType: 'cat', duration: 'Up to 24 hours' },
              ]}
              onSelectPlan={(p) => {
                setSelectedPlan({
                  name: `${p.petType === 'cat' ? 'Cat' : 'Dog'} Boarding - ${p.name}`,
                  serviceType: `${p.petType}-boarding`,
                  price: p.price,
                  duration: p.duration,
                  petType: p.petType,
                });
                setShowBookingForm(true);
              }}
            />
          </div>

          {/* Notes */}
          {/* <div className="text-center mt-8 space-y-1 text-sm text-muted-foreground">
            <p>*Festive season rates are 25–30% higher</p>
            <p>*Food and litter charges are not included in cat boarding.</p>
          </div> */}

          {/* Home Pet Boarding Benefits */}
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="rounded-3xl overflow-hidden border border-border">
              <AppImage
                src="/assets/images/cat/cl2.webp"
                alt="Home pet boarding, cosy and cage-free"
                className="w-full h-[380px] object-cover"
              />
            </div>
            <div>
              <div className="flex items-baseline gap-2 mb-4">
                <h3 className="text-3xl font-heading font-bold">Home</h3>
                <h3 className="text-3xl font-heading font-bold text-primary">Pet Boarding</h3>
              </div>
              <div className="h-0.5 w-28 bg-primary mb-4" />
              <ul className="space-y-4">
                {[{
                  title: 'Cage-Free Comfort',
                  desc: 'Open spaces and cosy areas allow your pet to relax and play freely, reducing stress during their stay.'
                }, {
                  title: 'Personalised Attention',
                  desc: 'Our hosts tailor care to your pet’s personality—whether playful pup or calm kitty—ensuring they feel loved and secure.'
                }, {
                  title: 'Trusted Hosts',
                  desc: 'Every host undergoes thorough background checks and training to provide exceptional care.'
                }, {
                  title: 'Health and Safety First',
                  desc: 'Hosts follow strict hygiene standards and are trained to handle your pet’s health needs, keeping them safe and happy.'
                }, {
                  title: 'Tailored Routines',
                  desc: 'Share your pet’s daily schedule—walking, playtime, rest—and our hosts will maintain it for consistency and comfort.'
                }, {
                  title: 'Daily Updates',
                  desc: 'Receive photos and messages about your pet’s activities for peace of mind while you’re away.'
                }, {
                  title: 'Flexible Stays',
                  desc: 'From short-term daycare to extended boarding, we cater to your schedule with affordable rates.'
                }].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Icon name="PawPrint" size={18} className="text-primary mt-0.5" />
                    <p className="text-sm text-foreground">
                      <span className="font-semibold">{item.title}: </span>
                      {item.desc}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Comparison Section */}
          <div className="mt-12 grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
            {/* Home Boarding */}
            <div className="bg-purple-50 rounded-2xl p-6 border border-border">
              <h3 className="text-2xl font-heading font-bold text-foreground mb-4">
                Home Pet Boarding
              </h3>
              <ul className="space-y-4">
                {[
                  'Pets stay in a warm, home-like setting, not a facility.',
                  'Treated as family with one-on-one, personalised care.',
                  'Perfect for all pets, offering a calm, social space.',
                  'Free to move – no cages, mimicking their home comfort.',
                  'Modern care reflects how we now cherish pets as part of our family.',
                ].map((txt, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Icon name="PawPrint" size={18} className="text-primary mt-0.5" />
                    <span className="text-sm text-foreground">{txt}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Vs Kennels */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-border">
              <h3 className="text-2xl font-heading font-bold text-foreground mb-4">
                Vs Kennels
              </h3>
              <ul className="space-y-4">
                {[
                  'Pets are kept in cages, a traditional, outdated method.',
                  'Minimal attention, often causing stress in loud settings.',
                  'Best for pets used to crates or being around many animals.',
                  'Limited personal care – attention is split among many pets.',
                  'Less personal, lacking the family-like love pets need.',
                ].map((txt, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Icon name="PawPrint" size={18} className="text-muted-foreground mt-0.5" />
                    <span className="text-sm text-muted-foreground">{txt}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Image */}
            <div className="rounded-2xl overflow-hidden border border-border">
              <AppImage
                src="/assets/images/dog/db2.webp"
                alt="Home pet boarding comfort"
                className="w-full h-[340px] object-cover"
              />
            </div>
          </div>

          {/* Why Choose */}
          <div className="mt-12 text-center">
            <h3 className="text-3xl font-heading font-bold">
              Why Choose <span className="text-primary">PET&CO</span>
            </h3>
            <div className="mx-auto mt-3 h-0.5 w-40 bg-primary/60" />
          </div>

          {/* CTA */}
          <div className="flex justify-center mt-6">
            <Button
              size="lg"
              iconName="Calendar"
              onClick={() => {
                setSelectedPlan(selectedPlan || defaultService);
                setShowBookingForm(true);
              }}
            >
              Book Now
            </Button>
          </div>
        </div>
      </main>
      {showBookingForm && (
        <BookingForm service={selectedPlan || defaultService} onClose={() => setShowBookingForm(false)} />
      )}
      <Footer />
      <MobileBottomNav />
    </>
  );
};

export default PetBoardingPage;
