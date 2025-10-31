import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  email: string | null;
  created_at: string;
}

interface AuthContextType {
  profile: Profile | null;
  loading: boolean;
  signIn: (username: string) => Promise<{ error: any }>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'mindmaker_username';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for stored username
    const storedUsername = localStorage.getItem(STORAGE_KEY);
    if (storedUsername) {
      loadProfile(storedUsername);
    } else {
      setLoading(false);
    }
  }, []);

  const loadProfile = async (username: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();
      
      if (data && !error) {
        setProfile(data);
      } else {
        // Username doesn't exist anymore, clear storage
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (err) {
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (username: string) => {
    try {
      // Check if username exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .maybeSingle();

      if (fetchError) {
        return { error: fetchError };
      }

      if (existingProfile) {
        // Username exists, log in
        setProfile(existingProfile);
        localStorage.setItem(STORAGE_KEY, username);
        navigate('/ideation');
        return { error: null };
      } else {
        // Create new profile
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({
            username,
            display_name: username,
            email: null,
          })
          .select()
          .single();

        if (insertError) {
          if (insertError.code === '23505') {
            return { error: { message: 'Username already taken' } };
          }
          return { error: insertError };
        }

        setProfile(newProfile);
        localStorage.setItem(STORAGE_KEY, username);
        navigate('/ideation');
        return { error: null };
      }
    } catch (err) {
      return { error: err };
    }
  };

  const signOut = () => {
    setProfile(null);
    localStorage.removeItem(STORAGE_KEY);
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{
      profile,
      loading,
      signIn,
      signOut,
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
