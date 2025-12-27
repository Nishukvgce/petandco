import React from 'react';
import { Navigate } from 'react-router-dom';

// DryFood page: redirect to the canonical DogFood route that preselects "Dry Food"
export default function DryFood() {
  return <Navigate to="/shop-for-dogs/dogfood/dry-food" replace />;
}


