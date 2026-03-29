import { useEffect, useState } from 'react';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import SetPasswordPage from './pages/SetPasswordPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import StudentDashboardPage from './pages/StudentDashboardPage';
import AlumniDashboardPage from './pages/AlumniDashboardPage';
import { getApiBase } from './lib/apiBase';

type UserRole = 'admin' | 'student' | 'alumni';

const getDashboardRoute = (role: UserRole | null) => {
  if (role === 'admin') return '#/admin';
  if (role === 'alumni') return '#/alumni';
  return '#/student';
};

const getTokenStorage = (): Storage | null => {
  if (localStorage.getItem('accessToken')) return localStorage;
  if (sessionStorage.getItem('accessToken')) return sessionStorage;
  return null;
};

const clearStoredAuth = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userRole');
  sessionStorage.removeItem('accessToken');
  sessionStorage.removeItem('refreshToken');
  sessionStorage.removeItem('userRole');
};

function App() {
  const [route, setRoute] = useState(() => window.location.hash || '#/');
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const apiBase = getApiBase();

  useEffect(() => {
    const handleHashChange = () => setRoute(window.location.hash || '#/');
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    let mounted = true;

    const validateAuth = async () => {
      setIsAuthLoading(true);
      const tokenStorage = getTokenStorage();

      if (!tokenStorage) {
        if (!mounted) return;
        setIsAuthenticated(false);
        setUserRole(null);
        setIsAuthLoading(false);
        return;
      }

      const accessToken = tokenStorage.getItem('accessToken');
      if (!accessToken) {
        clearStoredAuth();
        if (!mounted) return;
        setIsAuthenticated(false);
        setUserRole(null);
        setIsAuthLoading(false);
        return;
      }

      const fetchMe = async (token: string) =>
        fetch(`${apiBase}/auth/me`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

      try {
        let meResponse = await fetchMe(accessToken);

        if (!meResponse.ok && meResponse.status === 401) {
          const refreshToken = tokenStorage.getItem('refreshToken');

          if (!refreshToken) {
            clearStoredAuth();
            if (!mounted) return;
            setIsAuthenticated(false);
            setUserRole(null);
            setIsAuthLoading(false);
            return;
          }

          const refreshResponse = await fetch(`${apiBase}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
          });

          if (!refreshResponse.ok) {
            clearStoredAuth();
            if (!mounted) return;
            setIsAuthenticated(false);
            setUserRole(null);
            setIsAuthLoading(false);
            return;
          }

          const refreshed = await refreshResponse.json();
          if (!refreshed?.accessToken) {
            clearStoredAuth();
            if (!mounted) return;
            setIsAuthenticated(false);
            setUserRole(null);
            setIsAuthLoading(false);
            return;
          }

          tokenStorage.setItem('accessToken', refreshed.accessToken);
          if (refreshed.refreshToken) {
            tokenStorage.setItem('refreshToken', refreshed.refreshToken);
          }

          meResponse = await fetchMe(refreshed.accessToken);
        }

        if (!meResponse.ok) {
          clearStoredAuth();
          if (!mounted) return;
          setIsAuthenticated(false);
          setUserRole(null);
          setIsAuthLoading(false);
          return;
        }

        const me = await meResponse.json();
        const role = me?.role as UserRole | undefined;

        if (!role || !['admin', 'student', 'alumni'].includes(role)) {
          clearStoredAuth();
          if (!mounted) return;
          setIsAuthenticated(false);
          setUserRole(null);
          setIsAuthLoading(false);
          return;
        }

        tokenStorage.setItem('userRole', role);
        if (!mounted) return;
        setIsAuthenticated(true);
        setUserRole(role);
      } catch {
        clearStoredAuth();
        if (!mounted) return;
        setIsAuthenticated(false);
        setUserRole(null);
      } finally {
        if (mounted) setIsAuthLoading(false);
      }
    };

    void validateAuth();

    return () => {
      mounted = false;
    };
  }, [apiBase, route]);

  // Get base route without query params
  const baseRoute = route.split('?')[0];

  if (isAuthLoading) return null;

  // Public routes
  if (baseRoute === '#/login') {
    if (isAuthenticated) {
      const target = getDashboardRoute(userRole);
      if (window.location.hash !== target) window.location.hash = target;
      return null;
    }
    return <LoginPage />;
  }
  if (baseRoute === '#/register') {
    if (isAuthenticated) {
      const target = getDashboardRoute(userRole);
      if (window.location.hash !== target) window.location.hash = target;
      return null;
    }
    return <RegisterPage />;
  }
  if (baseRoute === '#/forgot') {
    if (isAuthenticated) {
      const target = getDashboardRoute(userRole);
      if (window.location.hash !== target) window.location.hash = target;
      return null;
    }
    return <ForgotPasswordPage />;
  }
  if (route.startsWith('#/set-password')) return <SetPasswordPage />;

  // Protected dashboard routes
  if (baseRoute === '#/admin' || baseRoute === '#/student' || baseRoute === '#/alumni') {
    if (!isAuthenticated) {
      if (window.location.hash !== '#/login') window.location.hash = '#/login';
      return null;
    }

    if (baseRoute === '#/admin' && userRole !== 'admin') {
      const target = getDashboardRoute(userRole);
      if (window.location.hash !== target) window.location.hash = target;
      return null;
    }
    if (baseRoute === '#/student' && userRole !== 'student') {
      const target = getDashboardRoute(userRole);
      if (window.location.hash !== target) window.location.hash = target;
      return null;
    }
    if (baseRoute === '#/alumni' && userRole !== 'alumni') {
      const target = getDashboardRoute(userRole);
      if (window.location.hash !== target) window.location.hash = target;
      return null;
    }

    if (baseRoute === '#/admin') return <AdminDashboardPage />;
    if (baseRoute === '#/student') return <StudentDashboardPage />;
    return <AlumniDashboardPage />;
  }

  // Default: Landing page
  if (isAuthenticated) {
    const target = getDashboardRoute(userRole);
    if (window.location.hash !== target) window.location.hash = target;
    return null;
  }

  return <LandingPage />;
}

export default App;
