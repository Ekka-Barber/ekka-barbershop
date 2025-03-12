
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
  const location = useLocation();
  const navigate = useNavigate();

  // Initialize authentication state on component mount or URL change
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const accessParam = params.get('access');
    
    // If access key is in URL, store it
    if (accessParam === 'owner123') {
      setIsAuthenticated(true);
      setAccessKey(accessParam);
      
      // Store in session storage for persistence across refreshes
      sessionStorage.setItem('ekka_admin_access', accessParam);
    } else {
      // Check session storage if not in URL
      const storedAccess = sessionStorage.getItem('ekka_admin_access');
      if (storedAccess === 'owner123') {
        setIsAuthenticated(true);
        setAccessKey(storedAccess);
      }
    }
  }, [location]);

  const login = (key: string) => {
    if (key === 'owner123') {
      setIsAuthenticated(true);
      setAccessKey(key);
      sessionStorage.setItem('ekka_admin_access', key);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setAccessKey(null);
    sessionStorage.removeItem('ekka_admin_access');
    navigate('/customer');
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
