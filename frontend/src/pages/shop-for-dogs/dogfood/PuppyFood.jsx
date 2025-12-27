import React from 'react';
import { Navigate } from 'react-router-dom';

export default function PuppyFood(){
  return <Navigate to="/shop-for-dogs/dogfood/puppy-food" replace />;
}