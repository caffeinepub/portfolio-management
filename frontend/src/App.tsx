import { useEffect } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import ProfileSetupPage from './pages/ProfileSetupPage';
import Dashboard from './pages/Dashboard';

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const queryClient = useQueryClient();

  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched: profileFetched,
    error: profileError,
  } = useGetCallerUserProfile();

  // Clear query cache on logout
  useEffect(() => {
    if (!isAuthenticated) {
      queryClient.clear();
    }
  }, [isAuthenticated, queryClient]);

  // Show loading spinner only during initial identity check
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!isAuthenticated) {
    return (
      <>
        <LoginPage />
        <Toaster />
      </>
    );
  }

  // Authenticated but profile still loading (with error fallback to avoid infinite spinner)
  if (isAuthenticated && profileLoading && !profileFetched && !profileError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Show profile setup if authenticated but no profile yet
  const showProfileSetup =
    isAuthenticated && !profileLoading && profileFetched && userProfile === null && !profileError;

  if (showProfileSetup) {
    return (
      <>
        <ProfileSetupPage onComplete={() => {}} />
        <Toaster />
      </>
    );
  }

  // Main dashboard
  return (
    <>
      <Layout>
        <Dashboard />
      </Layout>
      <Toaster />
    </>
  );
}
