import React from 'react';
import { Navigate } from 'react-router-dom';

export default function NameTags() {
  return <Navigate to="/shop-for-dogs/walk-essentials?category=Name%20Tags" replace />;
}
