import React from 'react';
import { Helmet } from 'react-helmet';
import PharmacyMenu from '../PharmacyMenu';

const CatPharmacyPage = () => {
  return (
    <>
      <Helmet>
        <title>Pharmacy — Cats | Pet & Co</title>
      </Helmet>
      <div className="container mx-auto px-4 py-8">
        <h1 className="font-heading font-bold text-2xl mb-4">Pharmacy — Cats</h1>
        <PharmacyMenu />
      </div>
    </>
  );
};

export default CatPharmacyPage;
