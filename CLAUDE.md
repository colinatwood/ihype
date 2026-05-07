# iHYPE — Engineering reference for Claude Code

## NextAuth v5 beta pinning

`next-auth` is pinned to **`5.0.0-beta.31`** (exact, no caret) and mirrored in
`overrides` so transitive installs can't pull a different beta.
`@auth/prisma-adapter` is pinned to **`2.11.2`** for the same reason — the
adapter interface and the auth package must be bumped together.

### Why exact pinning matters for beta packages

npm's semver resolution of `^5.0.0-beta.31` matches `>=5.0.0-beta.31 <6.0.0`,
which includes future betas and the eventual stable release. NextAuth v5 betas
have shipped breaking changes to:
- `callbacks.jwt` / `callbacks.session` argument shapes
- `NextAuthConfig` cookie option names
- `PrismaAdapter` model expectations
- The `auth()` server-component helper return type

An unexpected bump during `npm install` on a fresh Vercel deploy can break the
login flow silently if the types still compile.

### Upgrade procedure

1. Read the [NextAuth releases](https://github.com/nextauthjs/next-auth/releases)
   for every beta between the current pin and the target version.
2. Check the `@auth/prisma-adapter` changelog for the matching release.
3. Update both version strings in `package.json` — the `dependencies` entry
   **and** the `overrides` entry.
4. Run `npm install` locally and verify `node_modules/next-auth/package.json`
   shows the expected version.
5. Test the OTP login flow end-to-end (challenge creation → OTP verify →
   session cookie → `auth()` in a server component → `useSession` in a client
   component).
6. Verify `session.user.role` is still populated via the `jwt` / `session`
   callbacks in `src/lib/auth.config.ts`.
7. Deploy to a preview environment and confirm Prisma adapter migrations are
   not needed for the `Account`, `Session`, or `VerificationToken` models.
