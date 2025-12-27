import React from 'react';
import { Navigate } from 'react-router-dom';

export default function WetFood(){
  return <Navigate to="/shop-for-dogs/dogfood/wet-food" replace />;
}