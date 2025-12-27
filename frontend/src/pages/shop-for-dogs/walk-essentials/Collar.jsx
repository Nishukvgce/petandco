import React from 'react';
import { Navigate } from 'react-router-dom';

export default function Collar() {
  return <Navigate to="/shop-for-dogs/walk-essentials?category=Collar" replace />;
}
