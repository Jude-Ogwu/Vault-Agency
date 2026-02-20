-- Make seller_email nullable since sellers now join via invite links
-- seller_email gets populated when the seller accepts the invite
ALTER TABLE public.transactions
  ALTER COLUMN seller_email DROP NOT NULL;

-- Also set default to empty string for any existing null values
UPDATE public.transactions
  SET seller_email = ''
  WHERE seller_email IS NULL;

-- Update seller RLS policy to use seller_id (set when seller accepts invite link)
-- as the primary check, with seller_email as fallback for legacy records
DROP POLICY IF EXISTS "Sellers can view transactions where they are the seller" ON public.transactions;

CREATE POLICY "Sellers can view transactions where they are the seller"
  ON public.transactions FOR SELECT
  USING (
    auth.uid() = seller_id
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND email = transactions.seller_email
      AND transactions.seller_email != ''
    )
  );

-- Allow sellers to update transactions they are the seller on (for marking delivery etc.)
DROP POLICY IF EXISTS "Sellers can update their own transactions" ON public.transactions;

CREATE POLICY "Sellers can update their own transactions"
  ON public.transactions FOR UPDATE
  USING (auth.uid() = seller_id);
