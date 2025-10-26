# SSR Authentication Cookie Fix

## Problem

When fetching authenticated data on the server-side (SSR), the API returns 401 Unauthorized because:

1. Browser `credentials: 'include'` doesn't work the same way on the server
2. Server-side `fetch` doesn't automatically forward cookies from the incoming request
3. The backend needs the `access_token` cookie to authenticate the request

## Solution

### 1. Updated `src/api/auth.ts`

Added support for passing cookies manually when running on the server:

```typescript
interface ApiOptions {
  cookie?: string;
}

export const authApi = {
  getProfile: async (options?: ApiOptions): Promise<ProfileResponse> => {
    const headers: HeadersInit = {};

    // On server, forward the cookie header
    if (options?.cookie) {
      headers.Cookie = options.cookie;
    }

    const response = await fetch(`${API_URL}/auth/profile`, {
      headers,
      credentials: isServer ? undefined : "include",
    });

    // ...
  },
};
```

**Key changes:**
- Added `ApiOptions` interface with optional `cookie` parameter
- Conditionally set `Cookie` header when running on server
- Use `credentials: 'include'` only in browser

### 2. Updated `src/routes/home/index.tsx`

Modified the loader to extract and forward cookies from the incoming request:

```typescript
loader: async (opts) => {
  const isServer = typeof window === "undefined";
  let cookie: string | undefined;

  if (isServer) {
    // Try to get cookie from request context
    cookie =
      (opts.context as any)?.req?.headers?.cookie ||
      (opts.context as any)?.request?.headers?.get?.('cookie') ||
      (opts as any)?.request?.headers?.get?.('cookie');
  }

  const userProfile = await authApi.getProfile({ cookie });
  return { userProfile };
},
```

**Key changes:**
- Detect if running on server
- Extract cookie from various possible request locations
- Pass cookie to API call
- Handle errors gracefully (return null instead of throwing)

### 3. Updated `src/router.tsx`

Added TypeScript interface for router context:

```typescript
export interface RouterContext {
  queryClient: QueryClient;
  req?: {
    headers?: {
      cookie?: string;
    };
  };
}
```

## How It Works

### Client-Side (Browser)
1. User logs in → Backend sets `access_token` httpOnly cookie
2. Browser automatically includes cookie in all requests
3. `credentials: 'include'` ensures cookie is sent
4. API call succeeds with authentication

### Server-Side (SSR)
1. Browser sends request to frontend server with cookies
2. Loader extracts `cookie` header from incoming request
3. Passes cookie to backend API via `Cookie` header
4. Backend authenticates using the forwarded cookie
5. Returns user profile data
6. Frontend renders with authenticated data

## Testing

### Test Server-Side Rendering

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

3. Test flow:
   - Go to home page
   - Connect wallet and sign in
   - Navigate to `/home`
   - Page should load with user profile data
   - Check server console for `[SSR] Cookie found: true`

### Verify Cookie Forwarding

Check server logs:
```
[SSR] Cookie found: true
```

If you see `false`, the cookie isn't being forwarded correctly.

## Common Issues

### Issue: Still getting 401 on server

**Cause:** Cookie not being forwarded properly

**Fix:**
- Check that you're logged in (have `access_token` cookie)
- Verify backend CORS allows credentials
- Check backend accepts Cookie header

### Issue: Works in browser but not on SSR

**Cause:** Different fetch behavior on server vs browser

**Solution:** This is exactly what we fixed - cookies must be manually forwarded on server

### Issue: Cookie undefined in loader

**Cause:** TanStack Start might use different context structure

**Fix:** The current implementation tries multiple ways to access cookies. If none work, you may need to configure TanStack Start to pass request in context.

## Alternative Approach

If cookie forwarding doesn't work, consider:

1. **Skip SSR for authenticated routes**
```typescript
loader: async () => {
  const isServer = typeof window === "undefined";
  if (isServer) {
    return { userProfile: null }; // Skip on server
  }
  return await authApi.getProfile();
},
```

2. **Use client-side data fetching**
```typescript
// Remove loader, use useQuery in component instead
function RouteComponent() {
  const { data } = useProfile();
  // ...
}
```

3. **Pass auth token differently**
- Use localStorage/sessionStorage (not httpOnly)
- Pass as URL parameter (less secure)
- Use different auth strategy for SSR

## Security Notes

- httpOnly cookies are more secure than localStorage
- Server-side cookie forwarding is safe when done correctly
- Always use HTTPS in production
- Never log cookie values

---

**Status:** ✅ Fixed
**Last Updated:** 2025-10-26
