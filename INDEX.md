# git-away: Better Auth + GitHub OAuth Documentation Index

Welcome! This project implements GitHub OAuth authentication with Better Auth, Drizzle ORM, and Next.js.

## Getting Started

Start here if you're new to this project:

1. **[QUICK_START.md](./QUICK_START.md)** - Get up and running in 11 minutes
   - GitHub OAuth app setup
   - Environment variables configuration
   - Database migrations
   - Testing the auth flow

## Documentation

### For Understanding the System

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Detailed system architecture
  - System diagram showing all components
  - Complete authentication flow diagram
  - Session management explanation
  - Database schema details
  - Security features overview
  - Performance considerations

### For Implementation Details

- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - What was built
  - Files created/modified
  - Key features implemented
  - Environment variables needed
  - Setup steps with explanations
  - Testing the auth flow
  - Architecture overview
  - Security considerations
  - Next steps for extension

### For Advanced Setup & Deployment

- **[AUTH_SETUP.md](./AUTH_SETUP.md)** - Comprehensive setup guide
  - Detailed GitHub OAuth app creation
  - Full environment variable reference
  - Database migration details
  - All API routes explained
  - Troubleshooting guide
  - Production deployment instructions

## Project Structure

```
git-away/
├── app/
│   ├── page.tsx                 # Home page
│   ├── sign-in/page.tsx        # GitHub sign-in page
│   ├── dashboard/page.tsx      # Protected dashboard
│   ├── api/
│   │   └── auth/[...all]/      # Better Auth API handler
│   ├── layout.tsx              # Root layout
│   └── globals.css             # Global styles
│
├── lib/
│   ├── auth.ts                 # Better Auth server config
│   ├── auth-client.ts          # Client-side auth instance
│   └── db/
│       ├── db.ts               # Drizzle ORM instance
│       └── schema.ts           # Database tables
│
├── components/
│   └── sign-out-button.tsx     # Sign-out button component
│
├── Documentation/
│   ├── INDEX.md                # This file
│   ├── QUICK_START.md          # Quick start guide
│   ├── IMPLEMENTATION_SUMMARY.md
│   ├── ARCHITECTURE.md
│   ├── AUTH_SETUP.md
│   └── QUICK_START.md
│
└── Configuration/
    ├── drizzle.config.ts       # Drizzle Kit config
    ├── next.config.ts          # Next.js config
    ├── tsconfig.json           # TypeScript config
    └── .env.local              # Environment variables (not committed)
```

## Quick Reference

### Environment Variables

```bash
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=<generate-with-openssl>
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
GITHUB_CLIENT_ID=<your-github-oauth-id>
GITHUB_CLIENT_SECRET=<your-github-oauth-secret>
```

### Database Setup

```bash
npx drizzle-kit generate  # Create migrations
npx drizzle-kit push     # Apply to database
```

### Running the App

```bash
pnpm dev  # Start development server
```

## Key Technologies

- **Next.js 15.5.6** - React framework for production
- **Better Auth 1.3.32** - Authentication framework
- **Drizzle ORM 0.44.7** - Type-safe ORM
- **PostgreSQL** - Database
- **Tailwind CSS** - Styling
- **TypeScript** - Type safety

## Authentication Flow

```
User clicks "Sign In" 
    ↓
GitHub OAuth consent screen
    ↓
GitHub validates user
    ↓
Better Auth receives OAuth code
    ↓
Better Auth exchanges for access token
    ↓
GitHub user profile fetched
    ↓
User record created/updated in database
    ↓
Session stored in database
    ↓
HTTP-only cookie set in browser
    ↓
User redirected to dashboard
    ↓
Dashboard displays user information
```

## Features Implemented

✅ GitHub OAuth 2.0 authentication
✅ Secure session management
✅ Protected routes with automatic redirects
✅ User profile display with GitHub avatar
✅ Responsive UI with Tailwind CSS
✅ Server-side session validation
✅ Sign-out functionality
✅ Full user object display
✅ Beautiful error handling
✅ Type-safe database queries

## Routes

| Route | Description | Protected |
|-------|-------------|-----------|
| `/` | Home page | No |
| `/sign-in` | GitHub sign-in page | No |
| `/dashboard` | User dashboard | Yes |
| `/api/auth/[...all]` | Auth handler | Internal |

## Database Tables

- **user** - User profile and basic info
- **session** - Active sessions and tokens
- **account** - OAuth provider connections
- **verification** - Email verification state

## For Developers

### Adding More OAuth Providers

Edit `lib/auth.ts`:
```typescript
socialProviders: {
  github: { ... },
  google: { clientId: '...', clientSecret: '...' },
  // Add more providers here
}
```

### Accessing User Info in Components

Server Component:
```typescript
const session = await auth.api.getSession({ headers: await headers() })
const user = session.user
```

Client Component:
```typescript
const { data: session } = useSession()
const user = session?.user
```

### Custom User Fields

Edit `lib/db/schema.ts` to add fields to the `user` table:
```typescript
export const user = pgTable("user", {
  // ... existing fields
  customField: text("custom_field"),
})
```

## Common Tasks

### Check if User is Authenticated

```typescript
const session = await auth.api.getSession({ headers: await headers() })
if (!session) redirect("/sign-in")
```

### Sign Out Programmatically

```typescript
await signOut({ fetchOptions: { onSuccess: () => { /* ... */ } } })
```

### Get Session in Client Component

```typescript
const { data: session, isPending } = useSession()
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Session not persisting | Check BETTER_AUTH_SECRET is set correctly |
| GitHub login fails | Verify Client ID/Secret and callback URL |
| Database errors | Run `npx drizzle-kit push` |
| CORS issues | Check BETTER_AUTH_URL matches your domain |

## Performance Tips

1. Use Server Components for authenticated pages
2. Cache user data where possible
3. Use ISR (Incremental Static Regeneration) for public pages
4. Monitor session table for cleanup

## Security Best Practices

- Never commit `.env.local` to git
- Rotate BETTER_AUTH_SECRET regularly
- Use HTTPS in production
- Keep dependencies updated
- Use strong database passwords

## Resources

- [Better Auth Documentation](https://github.com/better-auth/better-auth)
- [Drizzle ORM Guide](https://orm.drizzle.team/docs/overview)
- [Next.js Documentation](https://nextjs.org/docs)
- [GitHub OAuth Docs](https://docs.github.com/en/developers/apps/building-oauth-apps)

## Next Steps

1. **Get it running**: Follow [QUICK_START.md](./QUICK_START.md)
2. **Understand it**: Read [ARCHITECTURE.md](./ARCHITECTURE.md)
3. **Customize it**: Refer to [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)
4. **Deploy it**: Check [AUTH_SETUP.md](./AUTH_SETUP.md) production section

## Support

- GitHub Issues: Report bugs on GitHub
- Better Auth: https://github.com/better-auth/better-auth/issues
- Drizzle: https://orm.drizzle.team

---

Last Updated: October 2025
