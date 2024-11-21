import { Navigate, useLocation } from 'react-router-dom';
import { useAuthUser } from '../security/AuthContext';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuthUser();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export default ProtectedRoute;