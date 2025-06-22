# Email Automation Backend

This is the backend API for the Email Automation application, built with Node.js, Express, and MongoDB.

## Features

- User authentication with JWT
- Email credential management
- Campaign tracking and statistics
- Secure password hashing
- Rate limiting and security middleware

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/resume-email-automation
JWT_SECRET=your-super-secret-jwt-key-that-is-at-least-32-characters-long
JWT_EXPIRES_IN=90d
CRYPTO_KEY=your-super-secret-crypto-key-that-must-be-32-bytes-long
```

### 3. Database Setup

Make sure MongoDB is running on your system. The application will automatically create the database and collections when it first connects.

### 4. Start the Server

```bash
npm start
```

The server will start on port 5000 (or the port specified in your .env file).

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### User Management
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/change-password` - Change password

### Credentials
- `GET /api/credentials` - Get all user credentials
- `POST /api/credentials` - Add new credential
- `GET /api/credentials/:id` - Get specific credential
- `DELETE /api/credentials/:id` - Delete credential

### Campaigns
- `GET /api/campaigns/stats` - Get campaign statistics
- `GET /api/campaigns` - Get all campaigns
- `POST /api/campaigns` - Create new campaign
- `GET /api/campaigns/:id` - Get specific campaign
- `PUT /api/campaigns/:id` - Update campaign
- `DELETE /api/campaigns/:id` - Delete campaign

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting to prevent abuse
- Helmet for security headers
- CORS configuration
- Input validation and sanitization

## Database Models

### User
- name, email, password (hashed)
- password reset functionality
- timestamps

### Credential
- email, appPassword (encrypted), provider
- linked to user
- timestamps

### Campaign
- name, subject, template, recipients
- status tracking (draft, in-progress, completed, failed)
- email statistics
- linked to user
- timestamps 