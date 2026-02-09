-- DEFINITIVE RLS FIX FOR NORDIC STUDIO
-- Run this in your Supabase SQL Editor

-- 1. Enable RLS on Tables
alter table products enable row level security;
alter table generated_images enable row level security;

-- 2. Drop existing policies to prevent conflicts
drop policy if exists "Users can select their own products" on products;
drop policy if exists "Users can insert their own products" on products;
drop policy if exists "Users can delete their own products" on products;
drop policy if exists "Users can select their own generated images" on generated_images;
drop policy if exists "Users can insert their own generated images" on generated_images;
drop policy if exists "Users can delete their own generated images" on generated_images;

-- 3. Products Table Policies
create policy "Users can select their own products"
on products for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can insert their own products"
on products for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can delete their own products"
on products for delete
to authenticated
using (auth.uid() = user_id);

-- 4. Generated Images Table Policies
create policy "Users can select their own generated images"
on generated_images for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can insert their own generated images"
on generated_images for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can delete their own generated images"
on generated_images for delete
to authenticated
using (auth.uid() = user_id);

-- 5. Storage Policies (Ensure buckets 'user-uploads' and 'generated-results' exist)
-- Use 'to authenticated' and check the folder name against user ID

-- SELECT (Download)
create policy "Users can download own files"
on storage.objects for select
to authenticated
using (
  (bucket_id = 'user-uploads' or bucket_id = 'generated-results')
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- INSERT (Upload)
create policy "Users can upload own files"
on storage.objects for insert
to authenticated
with check (
  (bucket_id = 'user-uploads' or bucket_id = 'generated-results')
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- DELETE
create policy "Users can delete own files"
on storage.objects for delete
to authenticated
using (
  (bucket_id = 'user-uploads' or bucket_id = 'generated-results')
  and (storage.foldername(name))[1] = auth.uid()::text
);