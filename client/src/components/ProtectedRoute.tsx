import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  console.log('🔧 ProtectedRoute Debug - user:', user);
  console.log('🔧 ProtectedRoute Debug - loading:', loading);

  if (loading) {
    console.log('🔧 ProtectedRoute Debug - Still loading, showing spinner');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    console.log('🔧 ProtectedRoute Debug - No user, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  console.log('🔧 ProtectedRoute Debug - User authenticated, rendering children');
  return <>{children}</>;
};

export default ProtectedRoute; 