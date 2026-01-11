# Database Integration Analysis for GitPilot

**Date:** 2026-01-10  
**Status:** Analysis  
**Purpose:** Evaluate whether integrating a database would benefit GitPilot

---

## Current Architecture

GitPilot currently operates as a **stateless application** that:
- Authenticates users via NextAuth.js with GitHub OAuth
- Stores session data in JWT tokens (access token, scopes, connection timestamp)
- Fetches all data directly from GitHub API in real-time
- Has no persistent storage beyond session cookies

### Current Data Flow
```
User → NextAuth Session → GitHub API → UI
```

---

## Use Cases for Database Integration

### 1. **Caching & Performance** ⭐⭐⭐⭐⭐

**Problem:** Every page load fetches fresh data from GitHub API
- Repository lists fetched on every visit
- Issue lists re-fetched on every filter change
- Rate limits hit quickly with multiple users or frequent refreshes

**Solution with DB:**
- Cache repository metadata (name, description, stars, last updated)
- Cache issue lists with TTL (time-to-live)
- Reduce GitHub API calls by 70-80%
- Implement background sync jobs

**Impact:** HIGH - Significantly improves performance and reduces rate limit issues

---

### 2. **User Preferences & Settings** ⭐⭐⭐⭐

**Problem:** No way to persist user preferences
- Filter presets lost on page refresh
- Favorite repositories not saved
- Sort preferences reset every session
- Selected repositories for issues view not remembered

**Solution with DB:**
```sql
CREATE TABLE user_preferences (
  user_id TEXT PRIMARY KEY,
  favorite_repos JSONB,
  issue_filter_presets JSONB,
  default_sort TEXT,
  theme TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**Impact:** HIGH - Major UX improvement

---

### 3. **Saved Filters & Presets** ⭐⭐⭐⭐

**Problem:** Users can't save complex filter combinations
- "Stale issues" filter (open > 90 days, no activity)
- "My team's issues" (specific repos + assignees)
- "High priority bugs" (label combinations)

**Solution with DB:**
```sql
CREATE TABLE filter_presets (
  id UUID PRIMARY KEY,
  user_id TEXT,
  name TEXT,
  filters JSONB,
  is_default BOOLEAN,
  created_at TIMESTAMP
);
```

**Impact:** MEDIUM-HIGH - Power user feature

---

### 4. **Bulk Operation History** ⭐⭐⭐

**Problem:** No audit trail for bulk operations
- Can't see what was changed
- Can't undo bulk operations
- No history of who did what

**Solution with DB:**
```sql
CREATE TABLE bulk_operations (
  id UUID PRIMARY KEY,
  user_id TEXT,
  action_type TEXT,
  issue_count INTEGER,
  succeeded INTEGER,
  failed INTEGER,
  details JSONB,
  created_at TIMESTAMP
);
```

**Impact:** MEDIUM - Useful for teams, audit compliance

---

### 5. **Scheduled Actions** ⭐⭐⭐

**Problem:** Can't schedule bulk operations
- "Close all stale issues next Monday"
- "Auto-label new issues based on title"
- "Weekly cleanup of archived repos"

**Solution with DB:**
```sql
CREATE TABLE scheduled_actions (
  id UUID PRIMARY KEY,
  user_id TEXT,
  action JSONB,
  schedule_cron TEXT,
  next_run TIMESTAMP,
  enabled BOOLEAN
);
```

**Impact:** MEDIUM - Advanced automation feature

---

### 6. **Team Collaboration** ⭐⭐

**Problem:** No way to share presets or collaborate
- Can't share filter presets with team
- Can't see what teammates are working on
- No shared dashboards

**Solution with DB:**
```sql
CREATE TABLE teams (
  id UUID PRIMARY KEY,
  name TEXT,
  members JSONB
);

CREATE TABLE shared_presets (
  id UUID PRIMARY KEY,
  team_id UUID,
  preset_id UUID,
  shared_by TEXT
);
```

**Impact:** LOW-MEDIUM - Only useful for teams

---

### 7. **Analytics & Insights** ⭐⭐

**Problem:** No historical data or trends
- Can't track issue velocity over time
- Can't see repository health trends
- No usage analytics

**Solution with DB:**
- Store snapshots of repo/issue metrics
- Generate trend reports
- Track user activity patterns

**Impact:** LOW-MEDIUM - Nice to have, not critical

---

## Database Options

### Option 1: **Supabase** (Recommended) ⭐⭐⭐⭐⭐

**Pros:**
- PostgreSQL with real-time subscriptions
- Built-in auth (can integrate with NextAuth)
- Row-level security (RLS)
- Free tier: 500MB database, 2GB bandwidth
- Edge functions for background jobs
- Already have MCP integration in project

**Cons:**
- Another service to manage
- Vendor lock-in (but PostgreSQL is portable)

**Cost:** Free tier sufficient for MVP, $25/mo for production

---

### Option 2: **Vercel Postgres** ⭐⭐⭐⭐

**Pros:**
- Native Vercel integration
- Serverless PostgreSQL
- Simple setup with `@vercel/postgres`
- Good for Next.js apps

**Cons:**
- More expensive ($20/mo minimum)
- Limited free tier (256MB)
- Less features than Supabase

**Cost:** $20/mo minimum

---

### Option 3: **Turso (SQLite)** ⭐⭐⭐

**Pros:**
- Edge-native SQLite
- Very fast reads
- Generous free tier
- Low latency globally

**Cons:**
- Limited SQL features vs PostgreSQL
- Newer, less mature ecosystem
- No built-in auth/RLS

**Cost:** Free tier very generous

---

### Option 4: **Redis/Upstash** ⭐⭐⭐

**Pros:**
- Perfect for caching
- Very fast
- Serverless Redis
- Good free tier

**Cons:**
- Not a primary database (key-value store)
- Need separate DB for structured data
- No complex queries

**Cost:** Free tier sufficient

---

## Recommended Approach

### Phase 1: **Caching Layer** (Immediate Value)
Use **Upstash Redis** for:
- Cache GitHub API responses (repos, issues)
- TTL-based invalidation (5-15 minutes)
- Reduce API calls by 70%+

**Effort:** Low (1-2 days)  
**Impact:** High  
**Cost:** Free tier

### Phase 2: **User Preferences** (High UX Value)
Add **Supabase** for:
- User preferences
- Saved filter presets
- Favorite repositories

**Effort:** Medium (3-5 days)  
**Impact:** High  
**Cost:** Free tier

### Phase 3: **Advanced Features** (Optional)
Expand Supabase usage for:
- Bulk operation history
- Scheduled actions
- Team collaboration

**Effort:** High (1-2 weeks)  
**Impact:** Medium  
**Cost:** $25/mo

---

## Implementation Priority

### ✅ **Immediate (Do Now)**
1. **Redis caching** for GitHub API responses
   - Reduces rate limits
   - Improves performance
   - Low effort, high impact

### 🟡 **Short-term (Next Sprint)**
2. **User preferences** in Supabase
   - Saved filters
   - Favorite repos
   - UI preferences

### 🔵 **Medium-term (Future)**
3. **Bulk operation history**
4. **Scheduled actions**
5. **Team features**

### ⚪ **Long-term (Maybe)**
6. **Analytics & insights**
7. **Advanced collaboration**

---

## Cost Analysis

### Current (No DB)
- **Cost:** $0/mo
- **GitHub API Rate Limits:** 5,000 requests/hour (authenticated)
- **Performance:** Slow, repeated API calls
- **UX:** No persistence, filters reset

### With Redis Only
- **Cost:** $0/mo (free tier)
- **GitHub API Calls:** Reduced by 70-80%
- **Performance:** Much faster
- **UX:** Still no persistence

### With Redis + Supabase
- **Cost:** $0-25/mo (free tier → paid)
- **GitHub API Calls:** Reduced by 80%+
- **Performance:** Fast
- **UX:** Full persistence, saved preferences

---

## Recommendation

**YES, integrate a database** - but do it incrementally:

1. **Start with Redis caching** (Upstash)
   - Immediate performance gains
   - No cost
   - Low effort
   - Solves rate limit issues

2. **Add Supabase for user data**
   - High UX value
   - Free tier sufficient initially
   - Enables saved preferences
   - Foundation for future features

3. **Expand features gradually**
   - Add bulk operation history
   - Add scheduled actions
   - Add team features
   - Based on user demand

### Why This Approach?
- **Incremental value:** Each phase delivers immediate benefits
- **Low risk:** Start with free tiers, scale as needed
- **Flexible:** Can adjust based on user feedback
- **Cost-effective:** Only pay for what you use

---

## Technical Considerations

### Data Models

#### User Preferences
```typescript
interface UserPreferences {
  userId: string;
  favoriteRepos: string[];
  issueFilterPresets: IssueFilterPreset[];
  defaultSort: 'created' | 'updated' | 'comments';
  defaultDirection: 'asc' | 'desc';
  theme: 'dark' | 'light';
  recentRepos: string[];
}
```

#### Cache Keys
```typescript
// Redis cache keys
`repos:${userId}` // TTL: 15 minutes
`issues:${repoFullName}:${filterHash}` // TTL: 5 minutes
`labels:${repoFullName}` // TTL: 1 hour
```

### Migration Strategy
1. Add Redis caching without breaking existing functionality
2. Add Supabase schema and migrations
3. Implement preference sync (write-through cache)
4. Add UI for managing preferences
5. Gradually add advanced features

---

## Conclusion

**Database integration is highly beneficial for GitPilot**, especially for:
- Performance (caching)
- User experience (saved preferences)
- Scalability (reduced API calls)

**Recommended stack:**
- **Upstash Redis** for caching (free)
- **Supabase** for user data (free → $25/mo)

**ROI:** High - Significant performance and UX improvements with minimal cost.
