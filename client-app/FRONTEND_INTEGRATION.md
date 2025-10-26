# Frontend Integration with Backend API

## Changes Summary

The frontend has been updated to integrate with the NestJS backend API using TanStack Query for state management and API interactions.

## New Files Created

### 1. API Layer (`src/api/auth.ts`)
Centralized API client for authentication endpoints with TypeScript interfaces:

- `authApi.login()` - Login with wallet signature
- `authApi.logout()` - Logout and clear session
- `authApi.getProfile()` - Get current user profile
- `authApi.refresh()` - Refresh authentication token

**Interfaces:**
- `LoginRequest` - Login payload structure
- `User` - User data structure
- `LoginResponse` - Login response structure
- `ProfileResponse` - Profile response structure

### 2. Custom Hooks (`src/hooks/auth/`)

#### `useLogin()`
- Mutation hook for login
- Automatically updates profile cache on success
- Returns `mutate`, `mutateAsync`, `isPending`, `error`

#### `useLogout()`
- Mutation hook for logout
- Clears profile cache on success
- Disconnects wallet

#### `useProfile(enabled?: boolean)`
- Query hook to fetch user profile
- Auto-refetches when enabled
- 5-minute stale time
- No retry on failure (401)

#### `useRefreshToken()`
- Mutation hook to refresh JWT token
- Updates profile cache with new token

### 3. Environment Variables
Created `.env` and `.env.example`:
```env
VITE_API_URL=http://localhost:3001
```

## Updated Files

### `src/components/Header.tsx`

**Removed:**
- Manual `useState` for `isVerified` and `isVerifying`
- Manual `useEffect` for auth check
- Manual `fetch` calls
- `verifyMessage` from viem (verification now on backend)

**Added:**
- TanStack Query hooks: `useLogin()`, `useLogout()`, `useProfile()`
- Automatic auth state management
- Cleaner error handling
- Type-safe API calls

**Key Changes:**

```typescript
// Before
const [isVerified, setIsVerified] = useState(false);
const [isVerifying, setIsVerifying] = useState(false);

// After
const { data: profileData, isLoading } = useProfile(!!address);
const loginMutation = useLogin();
const logoutMutation = useLogout();

const isVerified = !!profileData?.user;
const isVerifying = loginMutation.isPending || isLoading;
```

## Benefits of TanStack Query Integration

### 1. **Automatic Caching**
- Profile data cached for 5 minutes
- No redundant API calls
- Shared state across components

### 2. **Loading States**
- Built-in `isPending`, `isLoading` states
- No manual loading state management

### 3. **Error Handling**
- Automatic error capture
- Access to error via `mutation.error` or `query.error`

### 4. **Optimistic Updates**
- Profile cache updated immediately on login
- Cleared immediately on logout

### 5. **Type Safety**
- Full TypeScript support
- Type-safe mutations and queries

### 6. **Devtools Integration**
- TanStack Query Devtools already installed
- View cache, queries, and mutations in browser

## Authentication Flow

1. **User connects wallet** → wagmi `connectAsync()`
2. **Sign message** → wagmi `signMessageAsync()`
3. **Login mutation** → `loginMutation.mutateAsync()`
   - Sends signature to backend
   - Backend verifies signature
   - Returns JWT in httpOnly cookie
   - Profile cache updated
4. **Auto-check auth** → `useProfile()` query
   - Runs when address exists
   - Fetches profile from backend
   - Shows "Verified ✓" status
5. **Logout** → `logoutMutation.mutateAsync()`
   - Calls backend logout endpoint
   - Clears httpOnly cookie
   - Clears profile cache
   - Disconnects wallet

## Usage in Other Components

```typescript
import { useProfile, useLogin, useLogout } from "../hooks/auth";

function MyComponent() {
  const { data: profileData, isLoading } = useProfile();
  const loginMutation = useLogin();

  if (isLoading) return <div>Loading...</div>;

  if (!profileData?.user) {
    return <div>Not authenticated</div>;
  }

  return (
    <div>
      <p>Wallet: {profileData.user.walletAddress}</p>
      <p>User ID: {profileData.user.id}</p>
    </div>
  );
}
```

## Protected Routes Example

```typescript
import { useProfile } from "../hooks/auth";
import { Navigate } from "@tanstack/react-router";

function ProtectedPage() {
  const { data: profileData, isLoading } = useProfile();

  if (isLoading) return <div>Loading...</div>;

  if (!profileData?.user) {
    return <Navigate to="/" />;
  }

  return <div>Protected Content</div>;
}
```

## Testing

### With Backend Running:

1. Start backend:
```bash
cd be
npm run start:dev
```

2. Start frontend:
```bash
cd client-app
npm run dev
```

3. Open browser:
   - Go to `http://localhost:3000`
   - Open DevTools → Network tab
   - Connect wallet
   - Sign message
   - Check API calls to `http://localhost:3001/auth/login`
   - Check cookies for `access_token`

### Debug with TanStack Query Devtools:

The app includes TanStack Query Devtools. Press the devtools icon in the bottom-right of the browser to:
- View all queries and their status
- See cached profile data
- Monitor mutations (login/logout)
- Inspect query keys and cache

## Error Handling

Errors are automatically captured by TanStack Query:

```typescript
const loginMutation = useLogin();

if (loginMutation.error) {
  console.error("Login failed:", loginMutation.error.message);
}

// Or display in UI
{loginMutation.error && (
  <div className="error">
    {loginMutation.error.message}
  </div>
)}
```

## Next Steps

1. Add error toast notifications
2. Implement token refresh logic
3. Add retry strategies for failed requests
4. Create protected route wrapper
5. Add loading skeletons
6. Handle network errors gracefully

---

**Integration Status:** ✅ Complete
**Last Updated:** 2025-10-26
