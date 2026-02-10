-- Fix Foreign Keys to Cascade Delete
-- Run this in your Supabase SQL Editor to allow account deletion

-- 1. Profiles Table
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_id_fkey, -- Drop distinct constraint names if known, or generic approach
DROP CONSTRAINT IF EXISTS profiles_user_id_fkey; -- Common variations

-- Re-add with CASCADE
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_id_fkey
FOREIGN KEY (id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- 2. Products Table
ALTER TABLE public.products
DROP CONSTRAINT IF EXISTS products_user_id_fkey;

ALTER TABLE public.products
ADD CONSTRAINT products_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- 3. Generated Images Table
ALTER TABLE public.generated_images
DROP CONSTRAINT IF EXISTS generated_images_user_id_fkey,
DROP CONSTRAINT IF EXISTS generated_images_product_id_fkey;

ALTER TABLE public.generated_images
ADD CONSTRAINT generated_images_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- Also cascade product deletion to images
ALTER TABLE public.generated_images
ADD CONSTRAINT generated_images_product_id_fkey
FOREIGN KEY (product_id)
REFERENCES public.products(id)
ON DELETE CASCADE;
