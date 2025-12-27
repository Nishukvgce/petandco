import React from 'react';
import { Navigate } from 'react-router-dom';

export default function FetchToys() {
  return <Navigate to="/shop-for-dogs/dog-toys/fetch-toys" replace />;
}
