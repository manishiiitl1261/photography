# Photography Portfolio & Booking Platform

A full-stack application for photographers to showcase their work and for clients to book photography services.

## Recent Updates

**Dynamic Data Implementation:**
We've refactored services and pricing components to fetch data dynamically from the database instead of using static content files. This applies to both user-facing and admin components. Benefits include:
- Centralized data management through the database
- Real-time updates without code changes
- Consistent data across user and admin views
- Easier content management through the admin panel

A seed script has been added to quickly populate the database with initial services and pricing data:
```bash
cd photography/server
npm run seed
```

## Project Overview

This application is built with a modern tech stack:
- **Client**: Next.js, React, TailwindCSS, and HeadlessUI
- **Server**: Node.js, Express, MongoDB, and JWT-based authentication

## Features

- **User Authentication**
  - Secure login/registration with JWT
  - Email verification via OTP
  - Token refresh mechanism
  - Password reset functionality

- **User Profiles**
  - Profile management
  - Avatar upload
  - Portfolio creation
  - Photographer statistics

- **Portfolio Management**
  - Photo upload and organization
  - Gallery creation
  - Categories and tags

- **Booking System**
  - Service listing
  - Appointment scheduling
  - Payment processing
  - Order management

- **Reviews & Ratings**
  - Client feedback
  - Star ratings
  - Testimonials

- **Dynamic Content Management**
  - Services and packages managed via database
  - Admin dashboard for content updates
  - Responsive content display

## Project Structure

This project is organized into two main directories:

- `client/`: The Next.js frontend application
- `server/`: The Express backend API

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   ```

2. Set up the server:
   ```
   cd photography/server
   npm install
   ```

3. Set up the client:
   ```
   cd photography/client
   npm install
   ```

4. Configure environment variables:
   - Create `.env` in the server directory (see `.env.example`)
   - Create `.env.local` in the client directory (see `.env.example`)

5. Seed the database with initial services and pricing data:
   ```
   cd photography/server
   npm run seed
   ```

### Running the Application

1. Start the server:
   ```
   cd photography/server
   npm run dev
   ```

2. Start the client:
   ```
   cd photography/client
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:3000`

## Security Features

- Rate limiting to prevent brute force attacks
- CSRF protection
- Secure email verification
- JWT with refresh tokens
- Password strength validation
- Account lockout protection
- Comprehensive error logging

## Contributing

Please read our [Contributing Guidelines](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 