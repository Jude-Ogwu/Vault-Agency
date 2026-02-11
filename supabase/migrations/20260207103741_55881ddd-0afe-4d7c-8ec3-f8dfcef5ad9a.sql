-- Create enum for product types
CREATE TYPE public.product_type AS ENUM ('physical_product', 'digital_product', 'service');

-- Create enum for transaction status
CREATE TYPE public.transaction_status AS ENUM ('pending_payment', 'held', 'pending_delivery', 'pending_confirmation', 'pending_release', 'released', 'disputed', 'cancelled');

-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'buyer', 'seller');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create user roles table (security best practice)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE (user_id, role)
);

-- Create transactions table
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_title TEXT NOT NULL,
  deal_description TEXT,
  amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
  product_type product_type NOT NULL,
  status transaction_status DEFAULT 'pending_payment' NOT NULL,
  buyer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  buyer_email TEXT NOT NULL,
  seller_email TEXT NOT NULL,
  seller_phone TEXT,
  payment_reference TEXT,
  proof_url TEXT,
  proof_description TEXT,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  paid_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  confirmed_at TIMESTAMP WITH TIME ZONE,
  released_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS policies for transactions
CREATE POLICY "Buyers can view their own transactions"
  ON public.transactions FOR SELECT
  USING (auth.uid() = buyer_id);

CREATE POLICY "Sellers can view transactions where they are the seller"
  ON public.transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND email = transactions.seller_email
    )
  );

CREATE POLICY "Admins can view all transactions"
  ON public.transactions FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can create transactions"
  ON public.transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Buyers can update their own transactions"
  ON public.transactions FOR UPDATE
  USING (auth.uid() = buyer_id);

CREATE POLICY "Admins can update all transactions"
  ON public.transactions FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Function to handle updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  
  -- Default role is buyer
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'buyer');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create storage bucket for proof uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES ('proofs', 'proofs', true);

-- Storage policies for proofs bucket
CREATE POLICY "Anyone can view proofs"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'proofs');

CREATE POLICY "Authenticated users can upload proofs"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'proofs');

CREATE POLICY "Users can update their own proofs"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'proofs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own proofs"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'proofs' AND auth.uid()::text = (storage.foldername(name))[1]);