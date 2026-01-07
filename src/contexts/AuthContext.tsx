import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'customer' | 'admin';
  loyaltyPoints: number;
  subscription?: {
    plan: string;
    status: 'active' | 'inactive';
    expiresAt: string;
  };
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  adminLogin: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (username: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Dummy users for testing - Supabase ready structure
const DUMMY_USERS: Record<string, { password: string; user: User }> = {
  user1: {
    password: 'pass',
    user: {
      id: '1',
      username: 'user1',
      email: 'user1@example.com',
      role: 'customer',
      loyaltyPoints: 150,
      subscription: {
        plan: 'Premium',
        status: 'active',
        expiresAt: '2025-02-15',
      },
    },
  },
  admin: {
    password: 'admin123',
    user: {
      id: '2',
      username: 'admin',
      email: 'admin@bluetides.com',
      role: 'admin',
      loyaltyPoints: 0,
    },
  },
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored session - Supabase ready
    const storedUser = localStorage.getItem('bluetides_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('bluetides_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const userData = DUMMY_USERS[username];
    if (!userData) {
      return { success: false, error: 'User not found' };
    }
    if (userData.password !== password) {
      return { success: false, error: 'Invalid password' };
    }
    if (userData.user.role === 'admin') {
      return { success: false, error: 'Please use admin login' };
    }

    setUser(userData.user);
    localStorage.setItem('bluetides_user', JSON.stringify(userData.user));
    return { success: true };
  };

  const adminLogin = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const userData = DUMMY_USERS[username];
    if (!userData) {
      return { success: false, error: 'Admin not found' };
    }
    if (userData.password !== password) {
      return { success: false, error: 'Invalid password' };
    }
    if (userData.user.role !== 'admin') {
      return { success: false, error: 'Unauthorized access' };
    }

    setUser(userData.user);
    localStorage.setItem('bluetides_user', JSON.stringify(userData.user));
    return { success: true };
  };

  const signup = async (username: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (DUMMY_USERS[username]) {
      return { success: false, error: 'Username already exists' };
    }

    // In real app, this would create user in Supabase
    const newUser: User = {
      id: Date.now().toString(),
      username,
      email,
      role: 'customer',
      loyaltyPoints: 0,
    };

    setUser(newUser);
    localStorage.setItem('bluetides_user', JSON.stringify(newUser));
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('bluetides_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        adminLogin,
        signup,
        logout,
      }}
    >
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
