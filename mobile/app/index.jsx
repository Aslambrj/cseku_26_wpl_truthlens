import { Redirect } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { LoadingView } from '../components/ui';

export default function Index() {
  const { isLoading, user } = useAuth();

  if (isLoading) return <LoadingView label="Loading TruthLens..." />;
  return <Redirect href={user ? '/(tabs)' : '/login'} />;
}
