# Server Functions with TanStack Start

This document explains how we use `createServerFn` from TanStack Start to handle authenticated server-side data fetching.

## Overview

`createServerFn` is TanStack Start's way of creating server-side functions that can:
- Run only on the server
- Automatically receive request context (including cookies)
- Be called from loaders, components, or other server functions
- Handle API calls that require authentication

## Implementation

### Server Function Module (`src/api/auth.server.ts`)

We created a centralized module for auth-related server functions:

```typescript
import { createServerFn } from "@tanstack/react-start/server-fn";

export const getProfileServerFn = createServerFn().handler(async (ctx) => {
  // ctx.request contains the incoming HTTP request
  const cookie = ctx.request.headers.get("cookie");

  // Forward cookie to backend API
  const headers: HeadersInit = {};
  if (cookie) {
    headers.Cookie = cookie;
  }

  const response = await fetch(`${API_URL}/auth/profile`, { headers });
  return response.json();
});
```

**Key Features:**
- `ctx.request` - Access to incoming HTTP request
- `ctx.request.headers` - Access to request headers (including cookies)
- Automatically forwards cookies to backend API
- Only runs on server, never in browser

### Usage in Route Loader (`src/routes/home/index.tsx`)

```typescript
import { getProfileServerFn } from "@/api/auth.server";

export const Route = createFileRoute("/home/")({
  loader: async () => {
    const userProfile = await getProfileServerFn();
    return { userProfile };
  },
});
```

**Benefits:**
- Clean, simple loader code
- Type-safe server function calls
- Automatic cookie forwarding
- No manual request context handling

## How It Works

### Request Flow

1. **User visits `/home`**
   ```
   Browser → Frontend Server (/home)
   ```

2. **Loader calls server function**
   ```typescript
   loader: async () => await getProfileServerFn()
   ```

3. **Server function extracts cookies**
   ```typescript
   const cookie = ctx.request.headers.get("cookie");
   ```

4. **Forwards to backend API**
   ```
   Frontend Server → Backend API (/auth/profile)
   Headers: { Cookie: "access_token=..." }
   ```

5. **Backend authenticates and responds**
   ```
   Backend API → Frontend Server (user data)
   ```

6. **Page renders with data**
   ```
   Frontend Server → Browser (rendered HTML + data)
   ```

## Available Server Functions

### `getProfileServerFn()`

Fetches the authenticated user's profile.

**Returns:** `ProfileResponse | null`

**Usage:**
```typescript
const profile = await getProfileServerFn();
if (profile) {
  console.log(profile.user.walletAddress);
}
```

### `logoutServerFn()`

Logs out the user by clearing the session cookie.

**Returns:** `{ success: boolean }`

**Usage:**
```typescript
const result = await logoutServerFn();
if (result.success) {
  // Redirect or update UI
}
```

## Creating New Server Functions

### Template

```typescript
import { createServerFn } from "@tanstack/react-start/server-fn";

export const myServerFn = createServerFn().handler(async (ctx) => {
  // Get cookie for authenticated requests
  const cookie = ctx.request.headers.get("cookie");

  // Setup headers
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (cookie) {
    headers.Cookie = cookie;
  }

  // Make API call
  const response = await fetch(`${API_URL}/endpoint`, {
    method: "POST",
    headers,
    body: JSON.stringify({ data }),
  });

  if (!response.ok) {
    throw new Error("Request failed");
  }

  return response.json();
});
```

### With Parameters

```typescript
export const getCampaignServerFn = createServerFn()
  .validator((data: { id: string }) => data)
  .handler(async (ctx, { id }) => {
    const cookie = ctx.request.headers.get("cookie");

    const response = await fetch(`${API_URL}/campaigns/${id}`, {
      headers: cookie ? { Cookie: cookie } : {},
    });

    return response.json();
  });
```

**Usage:**
```typescript
const campaign = await getCampaignServerFn({ id: "123" });
```

## Best Practices

### 1. Use Server Functions for Protected Routes

Always use server functions when fetching authenticated data:

```typescript
// ✅ Good - Uses server function
loader: async () => {
  const data = await getProtectedDataServerFn();
  return { data };
}

// ❌ Bad - Manual fetch without cookie forwarding
loader: async () => {
  const res = await fetch(`${API_URL}/protected`);
  return res.json();
}
```

### 2. Centralize Server Functions

Keep all server functions in `src/api/*.server.ts` files:

```
src/api/
  ├── auth.ts          # Client-side API (browser)
  ├── auth.server.ts   # Server-side functions
  ├── campaigns.ts
  └── campaigns.server.ts
```

### 3. Handle Errors Gracefully

Return `null` or default values instead of throwing:

```typescript
export const getDataServerFn = createServerFn().handler(async (ctx) => {
  try {
    const response = await fetch(/* ... */);
    if (!response.ok) return null;
    return response.json();
  } catch (error) {
    console.error("Server function error:", error);
    return null;
  }
});
```

### 4. Add Logging

Log important information for debugging:

```typescript
console.log("[Server Fn] Operation - Cookie present:", !!cookie);
console.log("[Server Fn] Operation - Success");
console.error("[Server Fn] Operation - Error:", error);
```

### 5. Type Safety

Use TypeScript interfaces for return types:

```typescript
import type { ProfileResponse } from "./auth";

export const getProfileServerFn = createServerFn().handler(
  async (ctx): Promise<ProfileResponse | null> => {
    // ...
  }
);
```

## Debugging

### Check Server Logs

Server functions log to the server console, not browser console:

```bash
cd client-app
npm run dev

# Check terminal output:
[Server Fn] getProfile - Cookie present: true
[Server Fn] getProfile - Success
```

### Verify Cookie Forwarding

Add logging to check if cookies are being forwarded:

```typescript
const cookie = ctx.request.headers.get("cookie");
console.log("[DEBUG] Cookie:", cookie?.substring(0, 50) + "...");
```

### Test in Browser DevTools

1. Open Network tab
2. Navigate to route with server function
3. Look for document request
4. Check if response includes data

## Comparison: Client vs Server Functions

### Client-Side (Browser)

```typescript
// src/hooks/auth/useAuth.ts
export function useProfile() {
  return useQuery({
    queryFn: () => authApi.getProfile(),
    // credentials: 'include' sends cookies automatically
  });
}
```

**Use when:**
- Interactive user actions
- Client-side state management
- Need TanStack Query features (caching, refetching)

### Server-Side (SSR)

```typescript
// src/api/auth.server.ts
export const getProfileServerFn = createServerFn().handler(
  async (ctx) => {
    const cookie = ctx.request.headers.get("cookie");
    // Manual cookie forwarding required
  }
);
```

**Use when:**
- Initial page load (SSR)
- SEO-critical content
- Sensitive operations
- Better performance (no client-side round trip)

## Migration Guide

### From Manual Cookie Handling

**Before:**
```typescript
loader: async ({ context }) => {
  const cookie = context?.req?.headers?.cookie;
  const data = await authApi.getProfile({ cookie });
  return { data };
}
```

**After:**
```typescript
loader: async () => {
  const data = await getProfileServerFn();
  return { data };
}
```

### From Client-Only Fetching

**Before:**
```typescript
function Component() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/api/data').then(r => r.json()).then(setData);
  }, []);

  if (!data) return <div>Loading...</div>;
  return <div>{data}</div>;
}
```

**After:**
```typescript
// loader
loader: async () => {
  const data = await getDataServerFn();
  return { data };
}

// component
function Component() {
  const { data } = Route.useLoaderData();
  return <div>{data}</div>;
}
```

## Resources

- [TanStack Start Server Functions](https://tanstack.com/router/latest/docs/framework/react/start/server-functions)
- [TanStack Router Loaders](https://tanstack.com/router/latest/docs/framework/react/guide/data-loading)
- [Backend API Documentation](../be/README.md)

---

**Last Updated:** 2025-10-26
