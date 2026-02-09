-- 1. Create Products Table
create table products (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  sku text,
  image_url text not null,
  created_at timestamptz default now()
);

-- 2. Create Generated Images Table
create table generated_images (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  product_id uuid references products not null,
  template_id text not null,
  image_url text not null,
  resolution text not null,
  created_at timestamptz default now()
);

-- 3. Enable RLS
alter table products enable row level security;
alter table generated_images enable row level security;

-- 4. Create Policies
-- Products
create policy "Users can select their own products"
  on products for select
  using (auth.uid() = user_id);

create policy "Users can insert their own products"
  on products for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own products"
  on products for delete
  using (auth.uid() = user_id);

-- Generated Images
create policy "Users can select their own generated images"
  on generated_images for select
  using (auth.uid() = user_id);

create policy "Users can insert their own generated images"
  on generated_images for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own generated images"
  on generated_images for delete
  using (auth.uid() = user_id);

-- 5. Storage Buckets (These usually need to be created via the dashboard or API, but here is the policy intent)
-- Bucket: 'user-uploads'
-- Bucket: 'generated-results'

-- Storage Policies (Example for 'user-uploads')
-- insert into storage.buckets (id, name) values ('user-uploads', 'user-uploads');
-- create policy "Users can upload their own files"
-- on storage.objects for insert
-- with check ( bucket_id = 'user-uploads' and auth.uid() = owner );

-- create policy "Users can view their own files"
-- on storage.objects for select
-- using ( bucket_id = 'user-uploads' and auth.uid() = owner );
