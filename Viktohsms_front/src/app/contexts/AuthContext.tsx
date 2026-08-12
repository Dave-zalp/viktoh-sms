import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, User } from '../utils/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  logout: () => void;
  logoutCurrentDevice: () => Promise<void>;
  logoutAllDevices: () => Promise<void>;
  refreshUser: () => void;
  updateBalance: (balance: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = api.getUser();
    const token = api.getToken();
    
    if (storedUser && token) {
      setUser(storedUser);
    }
    
    setIsLoading(false);
  }, []);

  const logout = () => {
    api.logout();
    setUser(null);
  };

  const logoutCurrentDevice = async () => {
    try {
      await api.logoutCurrentDevice();
      api.logout();
      setUser(null);
    } catch (error) {
      // Clear local data even if API call fails
      api.logout();
      setUser(null);
      throw error;
    }
  };

  const logoutAllDevices = async () => {
    try {
      await api.logoutAllDevices();
      api.logout();
      setUser(null);
    } catch (error) {
      // Clear local data even if API call fails
      api.logout();
      setUser(null);
      throw error;
    }
  };

  const refreshUser = () => {
    const storedUser = api.getUser();
    setUser(storedUser);
  };

  const updateBalance = (balance: number) => {
    if (user) {
      const updatedUser = {
        ...user,
        balance: balance.toString()
      };
      setUser(updatedUser);
      api.setUser(updatedUser);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user && !!api.getToken(), 
      isLoading,
      isAdmin: user?.role === 'admin',
      logout,
      logoutCurrentDevice,
      logoutAllDevices,
      refreshUser,
      updateBalance
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}