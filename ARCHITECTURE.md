# Architecture & Authentication Flow

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Home (/)          Sign-In (/sign-in)    Dashboard (/dashboard)
│  ├─ Session check  ├─ GitHub OAuth      ├─ Session check
│  └─ Nav links      │  button             ├─ User object display
│                    └─ Loading state      └─ Sign out button
│                                                               │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              API Layer (Next.js Routes)                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  /api/auth/[...all]                                         │
│  ├─ GET/POST Better Auth Handler                           │
│  ├─ Callback: /callback/github                             │
│  ├─ SignIn: /sign-in/github                                │
│  ├─ SignOut: /sign-out                                     │
│  └─ Session: /get-session                                  │
│                                                               │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│            Better Auth Service Layer                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  lib/auth.ts                                                │
│  ├─ Database: Drizzle ORM Adapter                          │
│  ├─ Session: Cookie-based (HTTP-only)                      │
│  ├─ OAuth: GitHub Provider                                 │
│  └─ Plugins: Next.js Cookies Helper                        │
│                                                               │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              Database (PostgreSQL)                           │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  user table          session table      account table       │
│  ├─ id              ├─ id               ├─ id              │
│  ├─ name            ├─ userId           ├─ userId          │
│  ├─ email           ├─ expiresAt        ├─ providerId      │
│  ├─ emailVerified   ├─ token            ├─ accountId       │
│  ├─ image           └─ createdAt        └─ accessToken     │
│  └─ createdAt                                              │
│                                                               │
│  verification table                                         │
│  ├─ id                                                     │
│  ├─ identifier                                             │
│  ├─ value                                                  │
│  └─ expiresAt                                              │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Authentication Flow Diagram

```
User                    Client                  Server               GitHub
                        (Browser)              (Next.js)           (OAuth)
  │                       │                       │                   │
  │   Visit home          │                       │                   │
  │─────────────────────>│                       │                   │
  │                       │  GET /                │                   │
  │                       ├──────────────────────>│                   │
  │                       │                       │ Check session     │
  │                       │                       │ (cookies)         │
  │                       │  Session + HTML       │                   │
  │                       │<──────────────────────┤                   │
  │                       │                       │                   │
  │   Click Sign In       │                       │                   │
  │─────────────────────>│                       │                   │
  │                       │  POST /api/auth/      │                   │
  │                       │  signin/github        │                   │
  │                       ├──────────────────────>│                   │
  │                       │                       │  Redirect to      │
  │                       │                       │  GitHub OAuth     │
  │                       │<──────────────────────┤                   │
  │                       │ Redirect to GitHub    │                   │
  │                       │<───────────────────────────────────────────
  │                       │                       │                   │
  │   Authorize on        │                       │                   │
  │   GitHub              │                       │                   │
  ├──────────────────────────────────────────────────────────────────>│
  │                       │                       │                   │
  │                       │                       │ GitHub returns    │
  │                       │                       │ code              │
  │                       │                       │<──────────────────┤
  │                       │ Redirect with code    │                   │
  │                       │<───────────────────────                   │
  │                       │                       │                   │
  │                       │ POST /api/auth/       │                   │
  │                       │ callback/github       │                   │
  │                       ├──────────────────────>│                   │
  │                       │                       │ Exchange code     │
  │                       │                       │ for token         │
  │                       │                       ├──────────────────>│
  │                       │                       │ Get user profile  │
  │                       │                       │<──────────────────┤
  │                       │                       │                   │
  │                       │                       │ Store in DB:      │
  │                       │                       │ - User record     │
  │                       │                       │ - Session         │
  │                       │                       │ - Account link    │
  │                       │                       │                   │
  │                       │ Set-Cookie: session   │                   │
  │                       │ Redirect /dashboard   │                   │
  │                       │<──────────────────────┤                   │
  │   Redirected to       │                       │                   │
  │   dashboard           │                       │                   │
  │<─────────────────────┤                       │                   │
  │                       │ GET /dashboard        │                   │
  │                       ├──────────────────────>│                   │
  │                       │                       │ Validate session  │
  │                       │                       │ Load user data    │
  │                       │  User HTML + Avatar   │                   │
  │                       │<──────────────────────┤                   │
  │   See user info       │                       │                   │
  │ & profile picture     │                       │                   │
  │<─────────────────────┤                       │                   │
  │                       │                       │                   │
```

## Session Management

### Session Creation
1. User authorizes on GitHub
2. Better Auth exchanges authorization code for access token
3. Better Auth fetches user profile from GitHub
4. Better Auth creates:
   - User record in `user` table
   - Account link in `account` table
   - Session in `session` table
5. Session token stored in HTTP-only cookie

### Session Validation
1. Browser sends request with session cookie
2. Next.js middleware extracts cookie
3. Better Auth validates session token against `session` table
4. On match: User data loaded from `user` table
5. On mismatch or expired: Redirect to sign-in

### Session Expiration
1. Session token stored with expiration timestamp
2. Automatic cleanup removes expired sessions
3. User redirected to sign-in on next request

## Data Storage

### User Table
```sql
CREATE TABLE "user" (
    id text PRIMARY KEY,
    name text,
    email text UNIQUE,
    emailVerified boolean DEFAULT false,
    image text,
    createdAt timestamp DEFAULT now(),
    updatedAt timestamp DEFAULT now()
);
```

### Session Table
```sql
CREATE TABLE "session" (
    id text PRIMARY KEY,
    userId text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    expiresAt timestamp NOT NULL,
    token text NOT NULL UNIQUE,
    createdAt timestamp DEFAULT now(),
    updatedAt timestamp DEFAULT now(),
    ipAddress text,
    userAgent text
);
```

### Account Table
```sql
CREATE TABLE "account" (
    id text PRIMARY KEY,
    userId text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    providerId text NOT NULL,
    accountId text NOT NULL,
    accessToken text,
    refreshToken text,
    idToken text,
    accessTokenExpiresAt timestamp,
    refreshTokenExpiresAt timestamp,
    scope text,
    password text,
    createdAt timestamp DEFAULT now(),
    updatedAt timestamp DEFAULT now()
);
```

## Security Features

1. **HTTP-only Cookies**: Session tokens cannot be accessed by JavaScript
2. **Secure Flag**: Cookies only sent over HTTPS in production
3. **CSRF Protection**: Built into Better Auth
4. **Server-side Validation**: Every request validates session
5. **Token Expiration**: Sessions expire after configured time
6. **Database Integrity**: Foreign keys prevent orphaned sessions
7. **Environment Variables**: Secrets never exposed in code
8. **Provider Authentication**: OAuth handled by trusted GitHub servers

## Request Flow Example

### Unauthenticated Visit to Dashboard

```
1. GET /dashboard
   └─> No session cookie
   └─> middleware.ts (not configured in this setup)
   └─> Page component receives no session
   └─> Redirects to /sign-in
```

### Authenticated Request

```
1. GET /dashboard
   └─> Browser sends: Cookie: better-auth-session=xyz123
   └─> Next.js receives request
   └─> Page component calls: auth.api.getSession({headers})
   └─> Better Auth validates xyz123 token
   └─> Session found and valid
   └─> User data returned from database
   └─> Dashboard renders with user info
```

## Performance Considerations

1. **Minimal Database Queries**: Session validation is fast lookup
2. **Cookie-based**: No server-side session store overhead
3. **HTTP-only**: Prevents XSS attacks from stealing tokens
4. **Stateless**: Can scale horizontally across servers
5. **Async/Await**: Non-blocking database operations
