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

interface ConversationSession {
  id: string;
  user_id: string | null;
  business_context: any;
  session_title: string | null;
  status: string | null;
  started_at: string;
  last_activity: string;
}

interface AuthContextType {
  profile: Profile | null;
  loading: boolean;
  lastSession: ConversationSession | null;
  signIn: (username: string) => Promise<{ error: any; isExisting?: boolean }>;
  signOut: () => void;
  checkUsername: (username: string) => Promise<{ exists: boolean; profile?: Profile }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'mindmaker_username';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [lastSession, setLastSession] = useState<ConversationSession | null>(null);
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
        
        // Load last session for this user
        const { data: sessionData } = await supabase
          .from('conversation_sessions')
          .select('*')
          .eq('user_id', data.id)
          .order('last_activity', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (sessionData) {
          setLastSession(sessionData);
        }
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

  const checkUsername = async (username: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .maybeSingle();

      if (error) {
        return { exists: false };
      }

      return { exists: !!data, profile: data || undefined };
    } catch (err) {
      console.error('Error checking username:', err);
      return { exists: false };
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
        
        // Load last session
        const { data: sessionData } = await supabase
          .from('conversation_sessions')
          .select('*')
          .eq('user_id', existingProfile.id)
          .order('last_activity', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (sessionData) {
          setLastSession(sessionData);
        }
        
        localStorage.setItem(STORAGE_KEY, username);
        navigate('/ideation');
        return { error: null, isExisting: true };
      } else {
        // Create new profile
        const newId = crypto.randomUUID();
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert([{
            id: newId,
            username,
            display_name: username,
            email: null,
          }])
          .select()
          .single();

        if (insertError) {
          if (insertError.code === '23505') {
            return { error: { message: 'Username already taken' } };
          }
          return { error: insertError };
        }

        setProfile(newProfile);
        setLastSession(null);
        localStorage.setItem(STORAGE_KEY, username);
        navigate('/ideation');
        return { error: null, isExisting: false };
      }
    } catch (err) {
      return { error: err };
    }
  };

  const signOut = () => {
    setProfile(null);
    setLastSession(null);
    localStorage.removeItem(STORAGE_KEY);
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{
      profile,
      loading,
      lastSession,
      signIn,
      signOut,
      checkUsername,
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
