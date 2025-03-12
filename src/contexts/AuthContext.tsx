
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface AuthContextType {
  isAuthenticated: boolean;
  accessKey: string | null;
  login: (key: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [accessKey, setAccessKey] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Initialize authentication state on component mount
  useEffect(() => {
    const initAuth = () => {
      const params = new URLSearchParams(location.search);
      const accessParam = params.get('access');
      
      // First priority: check URL parameter
      if (accessParam === 'owner123') {
        console.log('Valid access key found in URL');
        setIsAuthenticated(true);
        setAccessKey(accessParam);
        sessionStorage.setItem('ekka_admin_access', accessParam);
        
        // If we're not on the admin route and should be, redirect
        if (!location.pathname.includes('/admin')) {
          console.log('Redirecting to admin from URL param auth');
          setTimeout(() => {
            navigate('/admin', { replace: true });
          }, 100);
        }
      } 
      // Second priority: check session storage
      else {
        const storedAccess = sessionStorage.getItem('ekka_admin_access');
        if (storedAccess === 'owner123') {
          console.log('Valid access key found in session storage');
          setIsAuthenticated(true);
          setAccessKey(storedAccess);
          
          // If we're on the customer page but should be on admin, redirect
          if (location.pathname === '/customer' && !location.search.includes('redirected=true')) {
            console.log('Redirecting to admin from session storage auth');
            setTimeout(() => {
              navigate('/admin', { replace: true });
            }, 100);
          }
        } else {
          // Not authenticated
          setIsAuthenticated(false);
          setAccessKey(null);
        }
      }
      
      setIsInitializing(false);
    };
    
    initAuth();
  }, [location.search, location.pathname, navigate]);

  const login = (key: string) => {
    if (key === 'owner123') {
      setIsAuthenticated(true);
      setAccessKey(key);
      sessionStorage.setItem('ekka_admin_access', key);
      console.log('Logging in, redirecting to admin');
      navigate('/admin', { replace: true });
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setAccessKey(null);
    sessionStorage.removeItem('ekka_admin_access');
    navigate('/customer?redirected=true', { replace: true });
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, accessKey, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
