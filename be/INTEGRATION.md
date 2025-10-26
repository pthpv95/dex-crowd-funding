# Frontend Integration Guide

This guide explains how to integrate the NestJS backend authentication with your React frontend.

## Backend API URL

The backend runs on `http://localhost:3001` by default.

## Authentication Flow

1. User connects wallet in frontend
2. Frontend generates a message for signing
3. User signs the message with their wallet
4. Frontend sends wallet address, signature, and message to backend `/auth/login`
5. Backend verifies signature and returns httpOnly cookie with JWT
6. Frontend can now make authenticated requests

## Frontend Implementation

### 1. Update Header Component

Modify `client-app/src/components/Header.tsx` to call the backend API:

```typescript
const handleVerifyMessage = async (connectedAddress: `0x${string}`) => {
  try {
    setIsVerifying(true);
    const message = `Welcome to CrowdFund!\n\nPlease sign this message to verify your wallet ownership.\n\nWallet: ${address}\nTimestamp: ${new Date().toISOString()}`;

    const signature = await signMessageAsync({ message });

    // Call backend API
    const response = await fetch('http://localhost:3001/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Important: includes cookies
      body: JSON.stringify({
        walletAddress: connectedAddress,
        signature,
        message,
      }),
    });

    if (!response.ok) {
      throw new Error('Authentication failed');
    }

    const data = await response.json();
    console.log('Login successful:', data);
    setIsVerified(true);
  } catch (error) {
    console.error('Error verifying message:', error);
    disconnect();
  } finally {
    setIsVerifying(false);
  }
};
```

### 2. Logout Implementation

```typescript
const handleLogout = async () => {
  try {
    await fetch('http://localhost:3001/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
    setIsVerified(false);
    disconnect();
  } catch (error) {
    console.error('Logout error:', error);
  }
};
```

### 3. Check Authentication Status

```typescript
// On app load, check if user is already authenticated
useEffect(() => {
  const checkAuth = async () => {
    try {
      const response = await fetch('http://localhost:3001/auth/profile', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        console.log('User is authenticated:', data.user);
        setIsVerified(true);
      }
    } catch (error) {
      console.log('Not authenticated');
    }
  };

  checkAuth();
}, []);
```

### 4. Making Authenticated Requests

For any protected API calls:

```typescript
const makeAuthenticatedRequest = async (endpoint: string, options = {}) => {
  const response = await fetch(`http://localhost:3001${endpoint}`, {
    ...options,
    credentials: 'include', // Always include credentials for httpOnly cookies
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Token expired or invalid
      setIsVerified(false);
      disconnect();
    }
    throw new Error(`Request failed: ${response.statusText}`);
  }

  return response.json();
};
```

## Environment Variables

Create a `.env.local` file in your frontend:

```env
VITE_API_URL=http://localhost:3001
```

Then use it in your code:

```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
```

## CORS Configuration

The backend is already configured to accept requests from `http://localhost:3000` (your frontend).

If your frontend runs on a different port, update the `.env` file in the backend:

```env
CORS_ORIGIN=http://localhost:YOUR_PORT
```

## Security Considerations

1. **httpOnly Cookies**: The JWT is stored in an httpOnly cookie, making it inaccessible to JavaScript and protecting against XSS attacks.

2. **Credentials**: Always include `credentials: 'include'` in fetch requests to send cookies.

3. **HTTPS in Production**: In production, ensure:
   - Backend uses HTTPS
   - Cookies have `secure: true` flag
   - `sameSite: 'strict'` or `'lax'` is set

4. **Token Expiration**: Tokens expire after 7 days by default. Implement token refresh logic if needed:

```typescript
const refreshToken = async () => {
  await fetch('http://localhost:3001/auth/refresh', {
    method: 'POST',
    credentials: 'include',
  });
};
```

## Testing the Integration

1. Start the backend:
```bash
cd be
npm run start:dev
```

2. Start the frontend:
```bash
cd client-app
npm run dev
```

3. Connect your wallet and sign the message
4. Check browser DevTools → Network tab to see the API calls
5. Check Application → Cookies to see the `access_token` cookie

## Troubleshooting

### CORS Errors
- Ensure `credentials: 'include'` is in fetch requests
- Check backend `.env` has correct `CORS_ORIGIN`
- Verify backend CORS is enabled in `main.ts`

### Cookie Not Set
- Check `credentials: 'include'` in fetch
- Verify response has `Set-Cookie` header
- Check browser cookie settings

### 401 Unauthorized
- Token might be expired
- Cookie might not be sent
- User might need to log in again

## API Reference

See [README.md](./README.md) for complete API documentation.
