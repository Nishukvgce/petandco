import React from 'react';
import { Link } from 'react-router-dom';

const Section = ({ title, items, base = '' }) => (
  <div className="flex-1 min-w-[180px]">
    <h4 className="text-sm font-semibold mb-3">{title}</h4>
    <ul className="space-y-2 text-sm text-muted-foreground">
      {items.map((it) => (
        <li key={it.slug}>
          <Link to={`${base}/${it.slug}`} className="hover:text-amber-600">
            {it.label}
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

const PharmacyMenu = () => {
  const dogs = [
    { slug: 'medicines-for-skin', label: 'Medicines for Skin' },
    { slug: 'joint-and-mobility', label: 'Joint & Mobility' },
    { slug: 'digestive-care', label: 'Digestive Care' },
    { slug: 'all-dog-pharmacy', label: 'All Dog Pharmacy' }
  ];

  const cats = [
    { slug: 'skin-coat-care', label: 'Skin & Coat Care' },
    { slug: 'worming', label: 'Worming' },
    { slug: 'oral-care', label: 'Oral Care' },
    { slug: 'all-cat-pharmacy', label: 'All Cat Pharmacy' }
  ];

  const medicines = [
    { slug: 'antibiotics', label: 'Antibiotics' },
    { slug: 'antifungals', label: 'Antifungals' },
    { slug: 'anti-inflammatories', label: 'Anti Inflammatories' },
    { slug: 'pain-relief', label: 'Pain Relief' },
    { slug: 'all-medicines', label: 'All Medicines' }
  ];

  const supplements = [
    { slug: 'vitamins-minerals', label: 'Vitamins & Minerals' },
    { slug: 'joint-supplements', label: 'Joint Supplements' },
    { slug: 'probiotics-gut-health', label: 'Probiotics & Gut Health' },
    { slug: 'skin-coat-supplements', label: 'Skin & Coat Supplements' },
    { slug: 'all-supplements', label: 'All Supplements' }
  ];

  const presc = [
    { slug: 'renal-support', label: 'Renal Support' },
    { slug: 'hypoallergenic-diets', label: 'Hypoallergenic Diets' },
    { slug: 'digestive-support', label: 'Digestive Support' },
    { slug: 'weight-management', label: 'Weight Management' },
    { slug: 'all-prescription-food', label: 'All Prescription Food' }
  ];

  return (
    <div className="bg-white rounded shadow-sm p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <Section title="PHARMACY FOR DOGS" items={dogs} base="/pharmacy/dogs" />
        <Section title="PHARMACY FOR CATS" items={cats} base="/pharmacy/cats" />
        <Section title="MEDICINES" items={medicines} base="/pharmacy/medicines" />
        <Section title="SUPPLEMENTS" items={supplements} base="/pharmacy/supplements" />
        <Section title="PRESCRIPTION FOOD" items={presc} base="/pharmacy/prescription-food" />
      </div>
    </div>
  );
};

export default PharmacyMenu;
