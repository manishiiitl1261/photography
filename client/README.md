# Photography Client Application

The frontend Next.js application for the Photography Portfolio & Booking Platform.

## Technology Stack

- **Next.js 15** - React framework
- **React 19** - UI library
- **TailwindCSS** - Utility-first CSS framework
- **HeadlessUI** - Unstyled, accessible UI components
- **Framer Motion** - Animation library
- **React Icons** - Icon library
- **TypeScript** - Type-safe JavaScript

## Features

- **Authentication System**
  - Login/Register with email and password
  - Email verification with OTP
  - Password reset functionality
  - Secure token management

- **User Profile**
  - Profile management
  - Avatar upload and cropping
  - Settings management

- **Photographer Portfolio**
  - Gallery view
  - Image lightbox
  - Categories and filtering

- **Booking System**
  - Service selection
  - Scheduling calendar
  - Payment integration
  - Booking management

- **Responsive Design**
  - Mobile-first approach
  - Dark/Light mode
  - Accessible UI components

## Project Structure

```
client/
│
├── public/              # Static assets
│   ├── assets/
│   └── favicon.ico
│
├── src/                 # Source code
│   ├── components/      # Reusable components
│   │   ├── auth/        # Authentication components
│   │   ├── layout/      # Layout components
│   │   └── ui/          # UI components
│   │
│   ├── contexts/        # React context providers
│   │   ├── AuthContext.jsx
│   │   └── LanguageContext.jsx
│   │
│   ├── pages/           # Next.js pages
│   │   ├── _app.tsx     # App component
│   │   ├── index.tsx    # Home page
│   │   ├── profile/     # Profile pages
│   │   └── ...
│   │
│   ├── styles/          # Global styles
│   │   └── globals.css
│   │
│   └── translations/    # Internationalization
│       ├── en.js
│       └── hi.js
│
├── .env.local           # Environment variables
├── next.config.ts       # Next.js configuration
├── tailwind.config.ts   # TailwindCSS configuration
└── package.json         # Dependencies and scripts
```

## Environment Variables

Create a `.env.local` file in the client directory with the following variables:

```
NEXT_PUBLIC_API_URL=http://localhost:5000
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

3. Build for production:
```
npm run build
```

4. Start production server:
```
npm start
```

## Key Components

### Authentication

- **LoginForm** - Handles user login with validation
- **RegisterForm** - User registration form with password strength meter
- **OTPVerificationForm** - Email verification with OTP input
- **AuthModal** - Modal container for authentication forms
- **AuthContext** - Manages authentication state and API calls

### User Interface

- **Navbar** - Main navigation with responsive design
- **Footer** - Site footer with links and information
- **ErrorBoundary** - Catches JavaScript errors in components
- **AuthWrapper** - Handles authentication-specific error states
- **LanguageProvider** - Provides internationalization support

## Authentication Flow

1. User registers with email/password via RegisterForm
2. Server sends OTP to user's email
3. User verifies email by entering OTP in OTPVerificationForm
4. Upon successful verification, user is logged in automatically
5. Token refresh happens automatically when needed
6. JWT tokens are securely stored and managed

## Error Handling

The application includes comprehensive error handling:

- **API Errors**: Displayed with user-friendly messages
- **Network Errors**: Handled with retry mechanisms
- **Authentication Errors**: Automatically logs out on critical errors
- **Form Validation**: Client-side validation prevents invalid submissions
- **Error Boundaries**: Catches JavaScript errors to prevent crash

## Internationalization

The application supports multiple languages:

- English (default)
- Hindi

Language can be switched using the language switcher in the navigation.
