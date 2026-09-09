// Example: using @supabase/server on Edge Functions / any fetch handler
// On Edge Functions you can import directly, no install needed:
//   import { withSupabase } from "npm:@supabase/server"
// On Node/Express backend, @supabase/server is already installed via `npm install @supabase/server`

// 1) Basic authenticated handler (RLS-scoped to user)
// -----------------------------------------------------
import { withSupabase } from '@supabase/server';

export const handler = withSupabase({ auth: 'user' }, async (req, ctx) => {
  // ctx.supabase       -> RLS-scoped client (user JWT)
  // ctx.supabaseAdmin  -> service_role client (bypasses RLS)
  // ctx.userClaims     -> { id, email, role }
  // ctx.jwtClaims      -> full JWT claims
  const { data: myPlants, error } = await ctx.supabase
    .from('plants')
    .select('id,name,price,stock_qty')
    .limit(10);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ plants: myPlants, user: ctx.userClaims });
});

// 2) Public catalog (no auth) + publishable-key gate
// -----------------------------------------------------
export const publicCatalog = withSupabase({ auth: 'none' }, async (req, ctx) => {
  const { data } = await ctx.supabase.from('plants').select('id,name,price').limit(20);
  return Response.json(data);
});

export const gatedCatalog = withSupabase({ auth: 'publishable' }, async (req, ctx) => {
  // validate `apikey: sb_publishable_...` header, then query as anon (RLS still applies)
  const { data } = await ctx.supabase.from('plants').select('id,name,cover_url').limit(20);
  return Response.json(data);
});

// 3) Direct Postgres (RLS-scoped transaction) — requires SUPABASE_DB_URL
// ------------------------------------------------------------------------
// npm install pg is peer dep for this middleware
// import { withSupabase } from '@supabase/server'
// import { withPostgresClient } from '@supabase/server/middleware/postgres'
// export const pgHandler = withSupabase({
//   auth: 'user',
//   middleware: [withPostgresClient()],
// }, async (req, ctx) => {
//   // ctx.postgres is a pg client already set to request.jwt.claims + role
//   const { rows } = await ctx.postgres.query('select * from plants where stock_qty > $1', [0]);
//   return Response.json(rows);
// });

// 4) Express (current backend) — use supabase-js directly (already wired in src/config/supabase.js)
// ---------------------------------------------------------------------------------------------------
// import supabase, { supabaseAdmin, supabaseEnv } from '../config/supabase.js';
// // RLS-scoped query as anon/publishable:
// const { data } = await supabase.from('plants').select('*');
// // Admin bypass RLS:
// const { data: orders } = await supabaseAdmin.from('orders').select('*');

// Env vars expected (see backend/.env.example):
// SUPABASE_URL=https://sxxmewhlotskvmsbwxyd.supabase.co
// SUPABASE_PUBLISHABLE_KEY=sb_publishable_1MtbnwIei4hu_G21T9JTpg_Ja0uk1LK
// SUPABASE_SECRET_KEY=sb_secret_...  (full key from dashboard, not masked)
// SUPABASE_JWKS_URL=https://sxxmewhlotskvmsbwxyd.supabase.co/auth/v1/.well-known/jwks.json
// On Edge Functions these are injected automatically.
