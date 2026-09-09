-- Supabase schema - run in SQL editor (expanded per request)
create extension if not exists "pgcrypto";

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text unique,
  description text,
  created_at timestamp default now()
);

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text unique,
  password_hash text,
  phone text,
  role text default 'user',
  email_verified boolean default false,
  blocked boolean default false,
  created_at timestamp default now()
);

-- Bootstrap admin account used by the admin dashboard.
-- Password hash is for: admin@2026
update users
set email = 'mohammedashiqueofficial7@gmail.com'
where email = 'admin2026@gmail.com'
  and not exists (select 1 from users where email = 'mohammedashiqueofficial7@gmail.com');

insert into users (name, email, password_hash, phone, role, email_verified)
values (
  'Admin',
  'mohammedashiqueofficial7@gmail.com',
  '$2a$10$y8mRl10UDywQnyPvp0kUYOltUKDdk2/8Zn1/x7Lr6/hBYMiYGR6BS',
  '',
  'admin',
  true
)
on conflict (email) do update set
  name = excluded.name,
  password_hash = excluded.password_hash,
  role = 'admin',
  email_verified = true;

create table if not exists addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  street text, city text, state text, postal_code text, country text,
  latitude float, longitude float, is_default boolean default false
);

-- NEW: plants with all requested columns
create table if not exists plants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  botanical_name text,
  category_id uuid references categories(id),
  sku text unique,
  price float not null,
  discount_price float,
  stock_qty int default 0,
  stock_status text default 'in_stock' check (stock_status in ('in_stock','low_stock','out_of_stock')),
  short_description text,
  long_description text,
  sunlight text,
  watering_frequency text,
  soil_type text,
  temperature_range text,
  humidity_preference text,
  fertilizer_schedule text,
  pet_safe boolean default false,
  growth_rate text check (growth_rate in ('slow','medium','fast')),
  mature_size text,
  difficulty_level text check (difficulty_level in ('easy','medium','hard')),
  pot_included boolean default true,
  pot_size text,
  height_at_shipping text,
  weight text,
  wholesale_price float,
  market_price float,
  variants jsonb default '[]'::jsonb,
  rating float default 4.5,
  care_instructions text,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

alter table plants add column if not exists variants jsonb default '[]'::jsonb;

-- NEW: normalized plant images
create table if not exists plant_images (
  id uuid primary key default gen_random_uuid(),
  plant_id uuid references plants(id) on delete cascade,
  image_url text not null,
  display_order int default 0,
  created_at timestamp default now()
);

-- NEW: expanded plant reviews
create table if not exists plant_reviews (
  id uuid primary key default gen_random_uuid(),
  plant_id uuid references plants(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  rating int check (rating >=1 and rating <=5),
  comment text,
  review_image_url text,
  created_at timestamp default now()
);

-- legacy reviews view compatibility
create or replace view reviews as select * from plant_reviews;

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  address_id uuid references addresses(id),
  subtotal float,
  shipping float default 0,
  total_amount float,
  status text,
  payment_status text,
  payment_method text default 'COD',
  note text,
  customer_phone text,
  owner_reply text,
  created_at timestamp default now()
);
alter table orders add column if not exists subtotal float;
alter table orders add column if not exists shipping float default 0;
create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  plant_id uuid references plants(id),
  quantity int,
  price_at_purchase float
);
create table if not exists cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  plant_id uuid references plants(id),
  quantity int
);
create table if not exists contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text, email text, subject text, message text, created_at timestamp default now()
);
alter table contact_messages add column if not exists reply text;
alter table contact_messages add column if not exists replied_at timestamp;
create table if not exists wishlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  plant_id uuid references plants(id)
);

-- indexes
create index if not exists idx_plants_category on plants(category_id);
create index if not exists idx_plant_images_plant on plant_images(plant_id, display_order);
create index if not exists idx_plant_reviews_plant on plant_reviews(plant_id);

-- updated_at trigger
create or replace function update_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end; $$ language plpgsql;
drop trigger if exists trg_plants_updated on plants;
create trigger trg_plants_updated before update on plants for each row execute function update_updated_at();

-- storage bucket for plant images: create bucket 'plant-images' public in Supabase Storage dashboard

-- Product catalog seed. Safe to run repeatedly: products are keyed by SKU.
insert into categories (name, description) values
  ('Indoor Plants', 'Perfect for interiors'),
  ('Succulents', 'Low maintenance plants')
on conflict (name) do nothing;

do $$
declare
  product record;
  product_id uuid;
  indoor_id uuid;
  succulent_id uuid;
begin
  select id into indoor_id from categories where name = 'Indoor Plants';
  select id into succulent_id from categories where name = 'Succulents';

  for product in
    select * from (values
      ('Lucky Bamboo', 'Dracaena sanderiana', 'GN-LUCK-005', 150::float, indoor_id,
       'Feng Shui plant that grows in water or soil.',
       '[{"id":"plastic-pot","label":"With Plastic Pot","priceMin":150,"priceMax":150},{"id":"cutting","label":"Cutting","priceMin":50,"priceMax":50},{"id":"cutting-cover","label":"Cutting + Plastic Cover","priceMin":95,"priceMax":95}]'::jsonb,
       array['/lucky bamboo.jpg']::text[]),
      ('Aloe Vera', 'Aloe barbadensis miller', 'GN-ALOE-001', 180::float, succulent_id,
       'Medicinal, low-maintenance succulent with gel-filled leaves.',
       '[{"id":"plastic-pot","label":"With Plastic Pot","priceMin":180,"priceMax":180},{"id":"cutting","label":"Cutting/Offset","priceMin":0,"priceMax":0,"disabled":true,"note":"cutting not available"},{"id":"cutting-cover","label":"Cutting + Plastic Cover","priceMin":150,"priceMax":150}]'::jsonb,
       array['/aloevera plant.png']::text[]),
      ('Red Calathea (Roseopicta)', 'Calathea roseopicta', 'GN-RCAL-007', 200::float, indoor_id,
       'Premium patterned foliage plant for bright indirect light.',
       '[{"id":"plastic-pot","label":"With Plastic Pot","priceMin":200,"priceMax":200},{"id":"cutting","label":"Cutting/Division","priceMin":130,"priceMax":130},{"id":"cutting-cover","label":"Cutting + Plastic Cover","priceMin":170,"priceMax":170}]'::jsonb,
       array['/red calathea.jpg']::text[]),
      ('Areca Palm', 'Dypsis lutescens', 'GN-AREC-006', 180::float, indoor_id,
       'Feathery air-purifying palm with a tropical appearance.',
       '[{"id":"plastic-pot","label":"With Plastic Pot","priceMin":180,"priceMax":180},{"id":"cutting","label":"Cutting/Division","priceMin":130,"priceMax":130},{"id":"cutting-cover","label":"Cutting + Plastic Cover","priceMin":150,"priceMax":150}]'::jsonb,
       array['/palm.jpg']::text[]),
      ('Chinese Evergreen (Aglaonema)', 'Aglaonema commutatum', 'GN-AGLA-003', 150::float, indoor_id,
       'Air-purifying indoor plant with elegant patterned foliage.',
       '[{"id":"plastic-pot","label":"With Plastic Pot","priceMin":150,"priceMax":150},{"id":"cutting","label":"Cutting/Division","priceMin":100,"priceMax":100},{"id":"cutting-cover","label":"Cutting + Plastic Cover","priceMin":120,"priceMax":120}]'::jsonb,
       array['/chinese evergreen.png']::text[]),
      ('Patharchatta (Bryophyllum)', 'Bryophyllum pinnatum', 'GN-PATH-004', 60::float, succulent_id,
       'Hardy medicinal succulent, also known as Paathi Pull.',
       '[{"id":"plastic-pot","label":"With Plastic Pot","priceMin":60,"priceMax":60},{"id":"cutting","label":"Cutting/Leaf","priceMin":20,"priceMax":20},{"id":"cutting-cover","label":"Cutting + Plastic Cover","priceMin":30,"priceMax":30}]'::jsonb,
       array['/paathi pull.jpg']::text[]),
      ('Calathea Plant', 'Goeppertia ornata', 'GN-CAL-002', 180::float, indoor_id,
       'Premium prayer plant with large striped foliage — tropical showstopper.',
       '[{"id":"plastic-pot","label":"With Plastic Pot","priceMin":180,"priceMax":180},{"id":"cutting","label":"Cutting/Division","priceMin":40,"priceMax":40},{"id":"cutting-cover","label":"Cutting + Plastic Cover","priceMin":50,"priceMax":50}]'::jsonb,
       array['/calathea plant.jpg', '/red calathea.jpg']::text[])
    ) as seed(name, botanical_name, sku, price, category_id, short_description, variants, images)
  loop
    insert into plants (name, botanical_name, category_id, sku, price, discount_price, wholesale_price, market_price, stock_qty, stock_status, short_description, long_description, sunlight, pet_safe, growth_rate, difficulty_level, pot_included, variants, rating)
    values (
      product.name, product.botanical_name, product.category_id, product.sku, product.price,
      case product.sku
        when 'GN-CAL-002' then 399
        when 'GN-ALOE-001' then 229
        when 'GN-RCAL-007' then 599
        else null
      end,
      case product.sku
        when 'GN-CAL-002' then 249
        when 'GN-ALOE-001' then 129
        when 'GN-RCAL-007' then 299
        else null
      end,
      case product.sku
        when 'GN-CAL-002' then 649
        when 'GN-ALOE-001' then 299
        when 'GN-RCAL-007' then 899
        else null
      end,
      case product.sku when 'GN-CAL-002' then 34 when 'GN-ALOE-001' then 85 else 50 end,
      'in_stock',
      product.short_description,
      case product.sku
        when 'GN-CAL-002' then 'Calathea (Prayer Plant) is a tropical interior gem known for large green leaves with cream stripes that move with light. Native to South American rainforests, it loves humidity and bright indirect light, ideal for living rooms. Ships in 12-18 cm pot with well-drained mix.'
        else product.short_description
      end,
      case product.sku when 'GN-CAL-002' then 'Indirect' else 'Indirect' end,
      case product.sku when 'GN-CAL-002' then true else false end,
      'medium', 'easy', true, product.variants,
      case product.sku when 'GN-CAL-002' then 4.7 when 'GN-ALOE-001' then 4.8 else 4.5 end
    )
    on conflict (sku) do update set
      name = excluded.name,
      botanical_name = excluded.botanical_name,
      category_id = excluded.category_id,
      price = excluded.price,
      discount_price = excluded.discount_price,
      wholesale_price = excluded.wholesale_price,
      market_price = excluded.market_price,
      stock_qty = excluded.stock_qty,
      short_description = excluded.short_description,
      long_description = excluded.long_description,
      pet_safe = excluded.pet_safe,
      rating = excluded.rating,
      variants = excluded.variants,
      updated_at = now()
    returning id into product_id;

    delete from plant_images where plant_id = product_id;
    insert into plant_images (plant_id, image_url, display_order)
    select product_id, image_url, image_order
    from unnest(product.images) with ordinality as image_data(image_url, image_order);
  end loop;
end $$;
