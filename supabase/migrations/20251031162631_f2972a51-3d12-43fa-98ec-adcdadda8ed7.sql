-- Update profiles table to not require auth.users link
-- First, drop the existing foreign key constraint
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Make id column a regular UUID with default
ALTER TABLE public.profiles ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Update RLS policies to work without auth.uid()
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Anyone can insert profiles (for username registration)
CREATE POLICY "Anyone can insert profiles"
ON public.profiles FOR INSERT
WITH CHECK (true);

-- Anyone can update profiles (simplified for username-only auth)
CREATE POLICY "Anyone can update profiles"
ON public.profiles FOR UPDATE
USING (true);