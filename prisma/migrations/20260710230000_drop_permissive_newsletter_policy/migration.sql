-- Supabase security advisor: NewsletterSubscription carried an anon INSERT
-- policy with WITH CHECK (true), letting anyone holding the anon key insert
-- rows directly — bypassing /api/newsletter/subscribe's rate limit, email
-- validation, and profile-existence check. The app has no supabase-js client
-- and writes only through Prisma (table owner, bypasses RLS), so no code path
-- uses this policy. Drop it; RLS stays enabled, restoring the same deny-all
-- posture as every other table.
DROP POLICY IF EXISTS "newsletter_insert_public" ON "NewsletterSubscription";
