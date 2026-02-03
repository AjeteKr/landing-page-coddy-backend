# Coddy NonLogin Backend

Backend API for public and non-authenticated features of the Coddy platform.

## Overview

This is a separate backend service that handles:
- Public course listings
- User authentication (login/register)
- Landing page information
- Public testimonials and statistics

## Features

✅ Public course discovery and browsing
✅ User registration with secure password hashing
✅ JWT-based authentication
✅ Rate limiting to prevent abuse
✅ Input validation and sanitization
✅ CORS configuration for frontend integration
✅ Security headers (Helmet.js)
✅ Centralized error handling
✅ Environment-based configuration

## Quick Start

### Prerequisites
- Node.js 16+
- npm or yarn
- PostgreSQL database (via Supabase)

### Installation

```bash
# Install dependencies
npm install

# Create .env file from template
cp .env.example .env

# Update .env with your configuration
```

### Running

```bash
# Development
npm run dev

# Production
npm start
```

The server will run on `http://localhost:5001` (default)

## API Endpoints

### Public Courses

- `GET /api/public/courses` - List all public courses
- `GET /api/public/courses/:id` - Get course details
- `GET /api/public/courses/category/:category` - List courses by category

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - New user registration
- `POST /api/auth/verify-token` - Verify JWT token

### Landing Page

- `GET /api/landing/info` - Landing page information
- `GET /api/landing/testimonials` - Public testimonials
- `GET /api/landing/stats` - Platform statistics

### Health Check

- `GET /api/health` - Service health status

## Security Features

### Rate Limiting
- General endpoints: 100 requests per 15 minutes
- Auth endpoints: 5 requests per 15 minutes

### Password Security
- Bcrypt hashing with 12 salt rounds
- Password requirements: min 8 chars, uppercase, number, special char

### JWT Security
- HS256 algorithm
- Configurable expiration time (default: 7 days)
- Token validation on protected endpoints

### Input Validation
- Email format validation
- Password strength requirements
- Content type enforcement
- XSS protection with input escaping
- SQL injection prevention via Supabase

## Environment Variables

```
PORT=5001
NODE_ENV=development
SUPABASE_URL=your_url
SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_KEY=your_key
JWT_SECRET=your_secret
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
NONLOGIN_FRONTEND_URL=http://localhost:3001
```

## Project Structure

```
backend/
├── config/              # Configuration files
├── middleware/          # Express middleware
├── routes/             # API route handlers
├── utils/              # Utility functions
├── server.js           # Main server file
├── package.json        # Dependencies
└── README.md           # This file
```

## Best Practices

1. **Environment Variables** - All sensitive data in .env, never in code
2. **Error Handling** - Centralized middleware for consistent responses
3. **Validation** - All inputs validated and sanitized
4. **Rate Limiting** - Protection against abuse and brute force
5. **Logging** - Structured error logging
6. **CORS** - Restricted to allowed origins only
7. **Security Headers** - Helmet.js for standard security headers

## Database Schema Requirements

### users table
- id (UUID)
- email (string, unique)
- password (hashed string)
- name (string)
- role (enum)
- is_active (boolean)
- created_at (timestamp)
- last_login (timestamp)

### courses table
- id (UUID)
- name (string)
- description (text)
- category (string)
- instructor (string)
- level (string)
- image_url (string)
- price (decimal)
- is_public (boolean)
- created_at (timestamp)

## Error Handling

All endpoints return consistent JSON responses:

### Success Response
```json
{
  "status": "success",
  "data": { ... }
}
```

### Error Response
```json
{
  "status": "error",
  "code": 400,
  "message": "Error description"
}
```

## Testing

Recommended tools:
- Postman
- Thunder Client
- cURL

Example login request:
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"SecurePass123!"}'
```

## Deployment

### Vercel Deployment
- Update `vercel.json` with environment variables
- Connect repository to Vercel
- Deploy with: `vercel deploy`

### Docker Deployment
Create `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5001
CMD ["npm", "start"]
```

## Support & Maintenance

- Monitor logs for errors
- Update dependencies regularly
- Review security headers
- Test new features thoroughly
- Keep API documentation updated

## License

ISC
