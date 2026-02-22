-- ══════════════════════════════════════════════════════════════
-- Migration: Add seller_joined enum, invite_links table,
-- fix RLS for public access, and add seller_id to transactions
-- ══════════════════════════════════════════════════════════════

-- 1. Add 'seller_joined' to transaction_status enum (if not already present)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'seller_joined'
      AND enumtypid = 'public.transaction_status'::regtype
  ) THEN
    ALTER TYPE public.transaction_status ADD VALUE 'seller_joined' AFTER 'pending_payment';
  END IF;
END $$;

-- 2. Add seller_id column to transactions (if not already added)
ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS seller_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Backfill seller_id where seller has an account matching seller_email
UPDATE public.transactions t
SET seller_id = p.id
FROM public.profiles p
WHERE p.email = t.seller_email
  AND t.seller_id IS NULL;

-- 3. Create invite_links table if it doesn't yet exist
CREATE TABLE IF NOT EXISTS public.invite_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  transaction_id UUID REFERENCES public.transactions(id) ON DELETE CASCADE NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  is_active BOOLEAN DEFAULT true,
  used_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS on invite_links
ALTER TABLE public.invite_links ENABLE ROW LEVEL SECURITY;

-- 4. Drop old restrictive policies and re-create
DROP POLICY IF EXISTS "invite_links_public_read" ON public.invite_links;
DROP POLICY IF EXISTS "Anyone can view invite links" ON public.invite_links;
DROP POLICY IF EXISTS "Buyers can create invite links" ON public.invite_links;
DROP POLICY IF EXISTS "invite_links_mark_used" ON public.invite_links;

-- Allow ANYONE (including unauthenticated / incognito) to read invite links
CREATE POLICY "invite_links_public_read"
  ON public.invite_links FOR SELECT
  USING (true);

-- Allow authenticated buyers to create invite links
CREATE POLICY "Buyers can create invite links"
  ON public.invite_links FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Allow authenticated users to mark an invite as used (when joining)
CREATE POLICY "invite_links_mark_used"
  ON public.invite_links FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 5. Allow sellers to update transactions once they've joined
DROP POLICY IF EXISTS "Sellers can update transactions they joined" ON public.transactions;
CREATE POLICY "Sellers can update transactions they joined"
  ON public.transactions FOR UPDATE
  USING (auth.uid() = seller_id);

-- 6. Also allow sellers to view transactions where they are the seller (by seller_id)
DROP POLICY IF EXISTS "Sellers can view by seller_id" ON public.transactions;
CREATE POLICY "Sellers can view by seller_id"
  ON public.transactions FOR SELECT
  USING (auth.uid() = seller_id);
