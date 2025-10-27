# git-away TODO: Live GitHub → GitLab Sync

## Implementation Roadmap (9 Phases)

---

## Phase 1: Update GitHub OAuth Scopes (Prerequisite)
**Goal:** Give your app permission to access all user repos and create webhooks

- [ ] **Update `lib/auth.ts`**
  - Add `scope` array to GitHub provider config
  - Include: `"repo"`, `"admin:repo_hook"`, `"read:user"`, `"user:email"`
  - Why: `repo` = full access to all repos; `admin:repo_hook` = webhook permissions

- [ ] **Deploy & Request User Re-auth**
  - After deployment, users must re-authorize (one-time)
  - They'll see the new scopes in GitHub OAuth dialog

---

## Phase 2: Add GitLab OAuth Provider (Parallel with Phase 1)
**Goal:** Allow users to connect their GitLab account

- [ ] **Update `lib/auth.ts`**
  - Add GitLab provider config (similar to GitHub)
  - Scopes: `api` (full access)

- [ ] **Update Database Schema** (see Phase 3)
  - Extend `account` table to track GitLab connection

- [ ] **Test GitLab Sign-in Flow**
  - Verify token is stored correctly in database

---

## Phase 3: Database Schema Updates (Foundation)
**Goal:** Create tables to track synced repositories

- [ ] **Create `userRepository` Table**
  ```sql
  CREATE TABLE "userRepository" (
    id text PRIMARY KEY,
    userId text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    githubRepoName text NOT NULL,           -- "owner/repo"
    gitlabProjectId integer NOT NULL,       -- numeric ID
    githubWebhookId integer,                -- to delete later
    createdAt timestamp DEFAULT now(),
    updatedAt timestamp DEFAULT now(),
    UNIQUE(userId, githubRepoName)
  );
  ```

- [ ] **Create `syncLog` Table** (optional, for debugging)
  ```sql
  CREATE TABLE "syncLog" (
    id text PRIMARY KEY,
    userRepositoryId text REFERENCES "userRepository"(id),
    commitHash text,
    status text,                            -- 'pending' | 'success' | 'failed'
    errorMessage text,
    createdAt timestamp DEFAULT now()
  );
  ```

- [ ] **Run Drizzle Migrations**
  - Update `lib/db/schema.ts`
  - Generate migration with Drizzle CLI
  - Apply to database

---

## Phase 4: GitHub API Helper Functions
**Goal:** Encapsulate GitHub API calls

- [ ] **Create `lib/github-api.ts`**
  - `getRepos(accessToken)` → List all user's repos
  - `getRepoDetails(accessToken, owner, repo)` → Fetch single repo info
  - `createWebhook(accessToken, owner, repo, webhookUrl, secret)` → Register webhook
  - `deleteWebhook(accessToken, owner, repo, webhookId)` → Remove webhook
  - `validateRepo(accessToken, owner, repo)` → Verify repo exists

- [ ] **Test Functions Locally**
  - Use a test GitHub token
  - Verify functions return correct data

---

## Phase 5: GitLab API Helper Functions
**Goal:** Encapsulate GitLab API calls

- [ ] **Create `lib/gitlab-api.ts`**
  - `getProjects(accessToken)` → List user's GitLab projects
  - `validateProjectAccess(accessToken, projectId)` → Check write permission
  - `pushCommit(accessToken, projectId, commitData)` → Mirror commit to GitLab
  - `validateProjectExists(accessToken, projectId)` → Verify project exists

- [ ] **Test Functions Locally**
  - Use a test GitLab token
  - Verify functions return correct data

---

## Phase 6: REST API Endpoints
**Goal:** Create CRUD operations for repository syncing

- [ ] **Install Dependencies**
  - Run: `pnpm add octokit @gitbeaker/rest`

- [ ] **Create `app/api/repos/route.ts` (GET)**
  - Endpoint: `GET /api/repos`
  - Returns all synced repos for authenticated user
  - Query DB for `userRepository` records

- [ ] **Create `app/api/repos/route.ts` (POST)**
  - Endpoint: `POST /api/repos`
  - Body: `{ githubRepo: "owner/name", gitlabProjectId: 123 }`
  - Steps:
    1. Validate user is authenticated
    2. Get GitHub & GitLab tokens from DB
    3. Validate GitHub repo exists
    4. Validate write access to GitLab project
    5. Create webhook on GitHub
    6. Store in `userRepository` table
    7. Return webhook info

- [ ] **Create `app/api/repos/[repoId]/route.ts` (DELETE)**
  - Endpoint: `DELETE /api/repos/[repoId]`
  - Steps:
    1. Verify user owns this repo entry
    2. Get webhook ID from DB
    3. Call GitHub to delete webhook
    4. Delete from `userRepository` table
    5. Return success

- [ ] **Create `app/api/github/repos/route.ts` (GET)**
  - Endpoint: `GET /api/github/repos`
  - Returns list of user's GitHub repos (for dropdown UI)
  - Uses cached token from DB

- [ ] **Create `app/api/gitlab/projects/route.ts` (GET)**
  - Endpoint: `GET /api/gitlab/projects`
  - Returns list of user's GitLab projects (for dropdown UI)
  - Uses cached token from DB

---

## Phase 7: Webhook Handler (Core Sync Logic)
**Goal:** Listen to GitHub push events and mirror to GitLab

- [ ] **Create `app/api/webhooks/github/route.ts` (POST)**
  - Endpoint: `POST /api/webhooks/github`
  - Steps on push event:
    1. Extract webhook signature from headers
    2. Verify signature with shared secret (HMAC-SHA256)
    3. Extract commit data: hash, message, author, files, diff
    4. Look up repo in `userRepository` table
    5. Get GitLab project ID & access token
    6. Call GitLab API to push commit
    7. Log result in `syncLog` table
    8. Return 200 OK

- [ ] **Error Handling in Webhook**
  - Invalid signature → return 403 (security)
  - Repo not found → return 204 (silently ignore)
  - GitLab API error → log error, return 202 (async retry possible)
  - Rate limited → store in queue for retry (optional for MVP)

- [ ] **Test Webhook Locally**
  - Use ngrok: `ngrok http 3000`
  - Create GitHub webhook pointing to ngrok URL
  - Make test commit
  - Verify webhook receives payload
  - Check GitLab repo for mirrored commit

---

## Phase 8: Dashboard UI
**Goal:** Connect everything in the frontend

- [ ] **Update `app/dashboard/page.tsx`**
  - Show user's GitHub account ✅
  - Show GitLab connection status
  - If GitLab NOT connected:
    - Display "Connect GitLab" button
    - On click → `/api/auth/signin/gitlab`
  - If GitLab connected:
    - Show "✅ GitLab Connected" badge

- [ ] **Create `components/add-repository-form.tsx`**
  - Form with two dropdowns:
    - GitHub repos (fetch from `GET /api/github/repos`)
    - GitLab projects (fetch from `GET /api/gitlab/projects`)
  - Submit button → `POST /api/repos`
  - Show success/error message

- [ ] **Create `components/repository-list.tsx`**
  - Display all synced repos from `GET /api/repos`
  - For each repo show:
    - GitHub repo name
    - GitLab project name
    - Last sync status
    - Delete button
  - Delete button → `DELETE /api/repos/[repoId]`

- [ ] **Create `components/connect-gitlab-button.tsx`**
  - Button component for GitLab OAuth
  - On click → redirect to GitLab signin

---

## Phase 9: Testing & Deployment
**Goal:** Verify everything works and deploy to production

### Local E2E Testing
- [ ] **Complete User Flow**
  1. Sign in with GitHub (verify scopes in OAuth dialog)
  2. Dashboard shows GitHub account
  3. Click "Connect GitLab"
  4. Authorize on GitLab
  5. Dashboard shows "✅ GitLab Connected"
  6. Click "Add Repository"
  7. Select a GitHub repo
  8. Select a GitLab project
  9. Click "Start Syncing"
  10. Repo appears in list

- [ ] **Make Test Commit**
  1. Make a commit to GitHub repo
  2. Push to GitHub
  3. Check webhook logs (verify payload received)
  4. Wait 10 seconds
  5. Check GitLab repo for mirrored commit

### Error Handling Tests
- [ ] Invalid GitHub repo (should show error)
- [ ] No write access to GitLab project (should show error)
- [ ] Delete repo from sync list (webhook should be removed)
- [ ] Webhook signature validation (invalid signature = 403)

### Production Deployment
- [ ] **Get production domain** (Vercel, Heroku, etc.)

- [ ] **Update GitHub OAuth App**
  - Set Authorization callback URL to: `https://yourdomain.com/api/auth/callback/github`

- [ ] **Create GitLab OAuth App**
  - Redirect URI: `https://yourdomain.com/api/auth/callback/gitlab`
  - Get `GITLAB_CLIENT_ID` and `GITLAB_CLIENT_SECRET`

- [ ] **Update Environment Variables**
  - `GITHUB_CLIENT_ID` → production value
  - `GITHUB_CLIENT_SECRET` → production value
  - `GITLAB_CLIENT_ID` → production value
  - `GITLAB_CLIENT_SECRET` → production value
  - `BETTER_AUTH_URL` → `https://yourdomain.com`

- [ ] **Deploy to Production**
  - Push to main/production branch
  - Verify build succeeds

- [ ] **Database & Backups**
  - Ensure PostgreSQL backups are configured
  - Verify database migrations applied in production

- [ ] **Monitoring**
  - Set up error tracking (Sentry recommended)
  - Monitor webhook endpoint for failed syncs
  - Test webhook endpoint via GitHub's delivery history

---

## Execution Order (Recommended)

```
1. Phase 1: GitHub OAuth scopes
   └─ Update auth.ts, deploy, users re-auth

2. Phase 3: Database schema
   └─ Update schema.ts, run migrations

3. Phase 2: GitLab OAuth
   └─ Update auth.ts, test sign-in

4. Phase 4-5: API helper functions
   └─ Test with local tokens

5. Phase 6: REST API endpoints
   └─ Test with Postman/curl

6. Phase 7: Webhook handler
   └─ Test with ngrok + test commit

7. Phase 8: Dashboard UI
   └─ Wire up all components

8. Phase 9: Testing & Production Deploy
   └─ E2E testing, then deploy
```

---

## Key Decision Points

**Q: Retry failed syncs automatically?**
- A: Not needed for MVP. Can add job queue later.

**Q: Show full sync history in UI?**
- A: Not needed for MVP. Skip `syncLog` table if not needed.

**Q: Support multiple GitLab accounts per user?**
- A: Keep simple: one GitLab account per user. Extend later if needed.

**Q: What about large commits (100+ files)?**
- A: GitLab API handles it. May need pagination/chunking for very large repos.

---

## Key Files to Create/Modify

```
lib/
├── auth.ts                    (MODIFY) - Add scopes & GitLab provider
├── github-api.ts              (NEW)
├── gitlab-api.ts              (NEW)
└── db/
    └── schema.ts              (MODIFY) - Add tables

app/
├── api/
│   ├── repos/
│   │   ├── route.ts           (NEW) - GET/POST repos
│   │   └── [repoId]/
│   │       └── route.ts       (NEW) - DELETE repo
│   ├── github/
│   │   └── repos/
│   │       └── route.ts       (NEW) - GET user's GitHub repos
│   ├── gitlab/
│   │   └── projects/
│   │       └── route.ts       (NEW) - GET user's GitLab projects
│   └── webhooks/
│       └── github/
│           └── route.ts       (NEW) - GitHub webhook handler
└── dashboard/
    └── page.tsx               (MODIFY) - Add GitLab UI

components/
├── connect-gitlab-button.tsx  (NEW)
├── add-repository-form.tsx    (NEW)
└── repository-list.tsx        (NEW)
```

---

## Dependencies to Add

```bash
pnpm add octokit @gitbeaker/rest
```

---

## Current Status

- ✅ GitHub OAuth (already implemented)
- ❌ Phase 1: GitHub OAuth scopes (todo)
- ❌ Phase 2: GitLab OAuth provider (todo)
- ❌ Phase 3: Database schema (todo)
- ❌ Phase 4-5: API helpers (todo)
- ❌ Phase 6: REST endpoints (todo)
- ❌ Phase 7: Webhook handler (todo)
- ❌ Phase 8: Dashboard UI (todo)
- ❌ Phase 9: Testing & Deploy (todo)
- ⏳ Future: Daily Zip Backup (later)
