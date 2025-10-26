# CrowdFund Backend API

NestJS backend with wallet-based authentication using Ethereum signature verification.

## Features

- **Wallet Authentication**: Login using Ethereum wallet signature verification
- **JWT Tokens**: Secure access tokens stored in httpOnly cookies
- **PostgreSQL**: User data persistence with TypeORM
- **CORS Enabled**: Ready for frontend integration

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

## Installation

```bash
npm install
```

## Configuration

1. Copy `.env.example` to `.env`
2. Update database credentials in `.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=crowdfunding
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

## Database Setup

1. Create PostgreSQL database:
```bash
createdb crowdfunding
```

Or using psql:
```sql
CREATE DATABASE crowdfunding;
```

2. The application will automatically create tables on startup (synchronize: true)

## Running the Application

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

The API will be available at `http://localhost:3001`

## API Endpoints

### Authentication

#### POST /auth/login
Login with wallet signature verification.

**Request Body:**
```json
{
  "walletAddress": "0x1234567890123456789012345678901234567890",
  "signature": "0x...",
  "message": "Welcome to CrowdFund!..."
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "walletAddress": "0x..."
  }
}
```

Sets `access_token` httpOnly cookie.

#### POST /auth/logout
Logout and clear authentication cookie.

**Response:**
```json
{
  "message": "Logout successful"
}
```

#### GET /auth/profile
Get current user profile (requires authentication).

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "walletAddress": "0x...",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### POST /auth/refresh
Refresh access token (requires authentication).

**Response:**
```json
{
  "message": "Token refreshed",
  "user": {
    "id": "uuid",
    "walletAddress": "0x..."
  }
}
```

## Message Format

The backend expects signatures for messages in this format:

```
Welcome to CrowdFund!

Please sign this message to verify your wallet ownership.

Wallet: {walletAddress}
Timestamp: {timestamp}
```

This matches the frontend implementation in `client-app/src/components/Header.tsx`.

## Security Features

- **httpOnly Cookies**: Tokens stored in httpOnly cookies to prevent XSS attacks
- **Signature Verification**: Ensures wallet ownership before authentication
- **JWT Validation**: All protected routes require valid JWT token
- **CORS Configuration**: Restricts API access to authorized origins

## Development

```bash
# Run in watch mode
npm run start:dev

# Run tests
npm run test

# Run e2e tests
npm run test:e2e

# Lint and format
npm run lint
npm run format
```

## Production Deployment

1. Set `NODE_ENV=production` in `.env`
2. Use a strong `JWT_SECRET`
3. Set `synchronize: false` in TypeORM config
4. Run migrations for database schema changes
5. Use a reverse proxy (nginx) for SSL/TLS
6. Enable proper database backups

## Integration with Frontend

Update your frontend to call the backend API:

```typescript
// Example login call
const response = await fetch('http://localhost:3001/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include', // Important for cookies
  body: JSON.stringify({
    walletAddress,
    signature,
    message
  })
});
```

## License

MIT
