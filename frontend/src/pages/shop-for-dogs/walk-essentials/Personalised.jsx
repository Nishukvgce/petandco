import React from 'react';
import { Navigate } from 'react-router-dom';

export default function Personalised() {
  return <Navigate to="/shop-for-dogs/walk-essentials?category=Personalised" replace />;
}
