import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated');

  if (isAuthenticated !== 'true') {
    return <Navigate to="/login" replace />;
  }

  // The angle brackets <> are a fragment, which is valid JSX.
  // TypeScript correctly infers the return type as JSX.Element | React.ReactElement
  return <>{children}</>;
};

export default ProtectedRoute;