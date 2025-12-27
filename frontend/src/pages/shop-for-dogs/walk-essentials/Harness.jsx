import React from 'react';
import { Navigate } from 'react-router-dom';

export default function Harness() {
  return <Navigate to="/shop-for-dogs/walk-essentials?category=Harness" replace />;
}
