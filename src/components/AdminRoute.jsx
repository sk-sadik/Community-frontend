import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

/**
 * Route protection wrapper. Restricts page access to admin users only.
 */
const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '80vh',
        fontSize: '1.25rem',
        fontWeight: '500',
        color: 'var(--text-secondary)'
      }}>
        Verifying Administrative Access...
      </div>
    );
  }

  return isAuthenticated && user && user.role === 'admin' ? children : <Navigate to="/" replace />;
};

export default AdminRoute;
