# Photography API Server

The backend REST API for the Photography Portfolio & Booking Platform.

## Technology Stack

- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication
- **Nodemailer** - Email service
- **Multer** - File uploads
- **Winston** - Logging

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login
- `POST /api/auth/verify-email` - Verify email with OTP
- `POST /api/auth/resend-verification` - Resend verification OTP
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/validate-reset-token` - Validate password reset token
- `POST /api/auth/reset-password` - Reset password

### User Profile

- `GET /api/auth/profile` - Get user profile
- `PATCH /api/auth/profile` - Update user profile
- `POST /api/auth/avatar` - Upload user avatar

### Reviews

- `GET /api/reviews` - Get all reviews
- `POST /api/reviews` - Create a new review
- `GET /api/reviews/:id` - Get a specific review
- `PATCH /api/reviews/:id` - Update a specific review
- `DELETE /api/reviews/:id` - Delete a specific review

## Project Structure

```
server/
│
├── config/             # Configuration files
│   └── upload.js       # Multer upload configuration
│
├── controllers/        # Route controllers
│   ├── authController.js
│   └── reviewController.js
│
├── middleware/         # Custom middleware
│   ├── auth.js         # Authentication middleware
│   ├── accountProtection.js # Rate limiting and security
│   └── csrfMiddleware.js # CSRF protection
│
├── models/             # Mongoose models
│   ├── User.js
│   └── Review.js
│
├── routes/             # Express routes
│   ├── authRoutes.js
│   └── reviewRoutes.js
│
├── utils/              # Utility functions
│   ├── emailService.js # Email functionality
│   └── logger.js       # Winston logger configuration
│
├── uploads/            # File uploads directory
├── logs/               # Log files
├── .env                # Environment variables
├── package.json        # Dependencies and scripts
└── server.js           # Entry point
```

## Environment Variables

Create a `.env` file in the server directory with the following variables:

```
# Server Configuration
PORT=5000

# MongoDB Connection
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>/<database>

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_LIFETIME=1d
JWT_REFRESH_SECRET=your_refresh_token_secret

# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=Your App <your_email@gmail.com>

# Client URL
CLIENT_URL=http://localhost:3000

# OTP Configuration
OTP_EXPIRY=10
```

## Development

1. Install dependencies:
```
npm install
```

2. Run in development mode:
```
npm run dev
```

3. For production:
```
npm start
```

## Security Features

- **Rate Limiting**: Prevents brute force attacks with different limits for sensitive routes
- **CSRF Protection**: Protects against cross-site request forgery
- **Account Lockout**: Locks accounts after multiple failed login attempts
- **Password Strength Validation**: Enforces strong passwords
- **JWT with Refresh Tokens**: Securely manages user sessions
- **OTP Email Verification**: Verifies user email addresses
- **Error Logging**: Comprehensive error tracking
- **Secure Headers**: Sets secure HTTP headers

## API Error Handling

All API endpoints follow a consistent error response format:

```json
{
  "success": false,
  "message": "Error message"
}
```

Success responses follow:

```json
{
  "success": true,
  "data": {...}
}
``` 