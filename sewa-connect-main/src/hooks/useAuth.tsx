import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import api from '@/services/api';

// Define User type based on backend response/token claims
export interface User {
  userId: number;
  email: string;
  role: string;
  fullName?: string;
  phoneNumber?: string;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithOtp: (email: string) => Promise<{ error: Error | null }>;
  verifyOtp: (email: string, otp: string) => Promise<{ error: Error | null }>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token and user data on load
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse stored user', e);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const signInWithOtp = async (email: string) => {
    try {
      const response = await api.post('/auth/request-otp', { email });

      // DEVE MODE BYPASS CHECK: If response contains user object and token
      if (response.data.token && response.data.userId) {
        const { token, ...userData } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
      }

      return { error: null };
    } catch (error: any) {
      console.error("OTP Request Error", error);
      return { error: new Error(error.response?.data?.message || 'Failed to send OTP') };
    }
  };

  const verifyOtp = async (email: string, otp: string) => {
    try {
      const response = await api.post('/auth/verify-otp', { email, otp });
      const { token, ...userData } = response.data;

      // Store auth data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));

      setUser(userData);
      return { error: null };
    } catch (error: any) {
      console.error("Verify OTP Error", error); // Debug log
      return { error: new Error(error.response?.data?.message || 'Failed to verify OTP') };
    }
  };

  const signOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    // Optional: Redirect to home or refresh
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithOtp, verifyOtp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return {
    ...context,
    isSuperAdmin: context.user?.role === 'SuperAdmin',
    isAdmin: context.user?.role === 'Admin' || context.user?.role === 'SuperAdmin' // Helper for admin access
  };
}
