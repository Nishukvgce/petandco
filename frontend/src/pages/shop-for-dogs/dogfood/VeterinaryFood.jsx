import React from 'react';
import { Navigate } from 'react-router-dom';

export default function VeterinaryFood(){
  return <Navigate to="/shop-for-dogs/dogfood/veterinary-food" replace />;
}