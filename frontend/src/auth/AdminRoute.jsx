import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';

export const AdminRoute = () => {
  const { user } = useAuth();

  return user?.role === 'admin'
    ? <Outlet />
    : <Navigate to="/home" replace />;
};
