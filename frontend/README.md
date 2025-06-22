# Email Automation Frontend

A modern React application for automating email campaigns with user authentication and credential management.

## Features

- **User Authentication**: Secure login/register with JWT
- **Profile Management**: Update profile information and change password
- **Credential Management**: Store and manage multiple email credentials securely
- **Email Campaigns**: Send single emails or bulk campaigns
- **Template Management**: Create and use email templates
- **Campaign Tracking**: Monitor email success/failure rates
- **Responsive Design**: Works on desktop and mobile devices

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm start
```

The application will start on `http://localhost:3000`

### 3. Backend Configuration

Make sure the backend server is running on `http://localhost:5000` before using the application.

## Application Structure

### Authentication Pages
- **Login** (`/login`): User sign-in
- **Register** (`/register`): New user registration
- **Forgot Password** (`/forgot-password`): Password reset

### Protected Pages
- **Dashboard** (`/dashboard`): Overview and quick actions
- **Single Email** (`/single-email`): Send individual emails
- **Bulk Email** (`/bulk-email`): Send to multiple recipients
- **Campaigns** (`/campaigns`): View and manage campaigns
- **Templates** (`/templates`): Email template management
- **Credentials** (`/credentials`): Manage email accounts
- **Profile** (`/profile`): User profile settings

## Key Components

### Authentication
- `AuthContext`: Manages user authentication state
- `ProtectedRoute`: Guards routes requiring authentication
- `Login/Register`: User authentication forms

### User Management
- `Profile`: Profile editing and password changes
- `Credentials`: Email credential management
- `Navbar`: Navigation with user menu

### Email Features
- `SingleEmail`: Individual email sending
- `BulkEmail`: Mass email campaigns
- `Templates`: Template management
- `Campaigns`: Campaign tracking

## Technologies Used

- **React**: Frontend framework
- **React Router**: Client-side routing
- **Axios**: HTTP client for API calls
- **Tailwind CSS**: Styling framework
- **JWT Decode**: Token handling
- **Context API**: State management

## Security Features

- JWT token-based authentication
- Protected routes
- Secure credential storage
- Input validation
- Error handling

## Getting Started

1. Start the backend server first
2. Create a user account
3. Add your email credentials
4. Create email templates
5. Start sending campaigns!

## API Integration

The frontend communicates with the backend API endpoints for:
- User authentication and management
- Email credential storage
- Campaign creation and tracking
- Template management 