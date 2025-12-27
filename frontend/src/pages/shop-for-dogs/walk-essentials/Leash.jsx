import React from 'react';
import { Navigate } from 'react-router-dom';

export default function Leash() {
  return <Navigate to="/shop-for-dogs/walk-essentials?category=Leash" replace />;
}
