import React from 'react';
import { Navigate } from 'react-router-dom';

export default function AllDogFood() {
  return <Navigate to="/shop-for-dogs/dogfood/all-dog-food" replace />;
}