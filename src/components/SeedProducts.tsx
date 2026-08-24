// NOTE: This project has migrated from Convex to Supabase.
// The old version of this component wrapped the whole app and blocked
// rendering until a Convex `products.list` query resolved, then ran a
// Convex `products.seed` mutation if the table was empty. Since Convex
// is no longer connected, that query never resolved — meaning this
// component was stuck showing "Loading catalogue" forever, blocking
// EVERY page behind it (not just the catalogue).
//
// This version is a plain pass-through. If you want automatic seeding
// of demo products when your Supabase `products` table is empty, say so
// and I'll wire up a Supabase-based version — but that's an opt-in
// convenience, not something that should ever block rendering.

export function SeedProducts({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}