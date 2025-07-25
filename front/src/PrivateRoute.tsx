import React from 'react';
import { Navigate } from 'react-router-dom';

interface PrivateRouteProps {
  children: React.ReactNode; 
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isLoggedIn') === 'true'; 

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;