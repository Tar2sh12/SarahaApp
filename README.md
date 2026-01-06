# SarahaApp - Backend

This repository contains the backend for SarahaApp — a Node.js/Express application that implements user authentication, anonymous messaging, and basic admin/user profile management. The project uses MongoDB (via Mongoose) for persistence, JWT for authentication, and includes utilities for email delivery, token management, and background cron jobs.

**Status:** Development (see `package.json` scripts for start commands)

**Key technologies:** Node.js, Express, MongoDB (Mongoose), JWT, Nodemailer, Joi, Luxon, node-schedule

**Table of contents**
- **Overview**: What the app does
- **Architecture**: High-level structure and patterns
- **Features**: Main endpoints and capabilities
- **Installation & Running**: How to run locally
- **Environment Variables**: Required configuration
- **Project structure**: Important folders and files
- **Notes & Recommendations**: Security and deployment tips

**Overview**

SarahaApp backend provides REST endpoints to:
- Register and authenticate users (email confirmation, refresh tokens, password reset)
- Send and retrieve messages (including pagination)
- Manage user profiles (view, update, change password)
- Admin actions (list all users, delete user)

The codebase follows a modular controller/service pattern and uses middleware for authentication, authorization, validation, and error handling.

**Architecture**

- Entry point: `index.js` -> `initiate-app.js` initializes Express, routers, DB connection and cron job
- Routing: `src/modules/*/*.controller.js` define routes and delegate to service functions
- Business logic: `src/modules/*/services/*.js` contain service implementations
- DB models: `DB/models/*.js` (Mongoose models)
- Middleware: `src/middleware/*` (authentication, authorization, validation, error handling)
- Utilities: `src/utils/*` (tokens, email templates, encryption, pagination helpers, crons, etc.)
- Background tasks: `node-schedule` used to clean expired blacklisted tokens

**Main features & API endpoints**

Authentication (`src/modules/Auth/auth.controller.js`):
- `POST /signUp` — create a new user (validated via Joi)
- `POST /login` — authenticate and receive access/refresh tokens
- `GET /confirmation/:confirmationToken` — confirm user email (token from email)
- `POST /refresh-token` — issue a new access token using refresh token
- `POST /sign-out` — sign out (requires auth)
- `PATCH /forget-password` — request password reset (generates token/email)
- `PUT /reset-password` — reset password via provided token

Messages (`src/modules/Messages/message.controller.js`):
- `POST /send-message` — send an anonymous message
- `GET /get-my-messages` — get messages for authenticated user
- `GET /get-paginate` — get paginated messages (requires auth)

User/Profile (`src/modules/User/profile.controller.js`):
- `GET /getInfo` — get profile info (requires auth)
- `GET /getAllUsers` — admin-only: list users (requires auth + admin role)
- `DELETE /deleteUser/:id` — admin-only: delete a user
- `PATCH /updaate-password` — update logged-in user's password
- `PUT /update-profile` — update user profile

Note: Routes are registered in `src/modules/index.js` and wired into the app via `router-handler.js`.

**Installation & Running**

Prerequisites:
- Node.js (v16+ recommended)
- MongoDB (or a connection string to a MongoDB Atlas cluster)

Install dependencies:

```bash
npm install
```

Run in development (uses `nodemon`):

```powershell
npm run start:dev
```

Run in production:

```powershell
npm start
```

By default the app loads environment variables via `dotenv` in `initiate-app.js` and expects a `PORT` value.

**Environment Variables**

The application uses environment variables for configuration. Create a `.env` file at the project root with values similar to:

```
PORT=3000
MONGO_URI=mongodb://localhost:27017/saraha
JWT_SECRET_KEY=your_jwt_secret_here
NODEMAILER_EMAIL=youremail@example.com
NODEMAILER_APP_PASSWORD=your_email_app_password
# any other cloudinary, file storage or third-party keys if used
```

Important: Use strong secrets for `JWT_SECRET_KEY` and secure SMTP credentials for production.

**Project structure (high level)**

- `index.js` — small bootstrap that calls `initiate-app.js`
- `initiate-app.js` — application initialization (Express, DB, cron jobs)
- `router-handler.js` — attaches routers to the Express app
- `DB/` — database setup and Mongoose models
- `src/modules/` — feature modules (Auth, Messages, User)
- `src/middleware/` — request middleware (auth, validation, error handling)
- `src/utils/` — helper utilities (tokens, email templates, crons, encryption)

**Utilities & Background Jobs**

- Token utilities: JWT generation/verification via `src/utils/tokens.utils.js`.
- Email: `src/Services/send-email.service.js` uses `nodemailer` and an event emitter for sending emails (confirmation, password reset).
- Cron: `src/utils/crons.utils.js` uses `node-schedule` to periodically remove expired blacklisted tokens (configured in `initiate-app.js`).

**Where to look in the code**

- Authentication services: `src/modules/Auth/Services/authentication.service.js`
- Profile services: `src/modules/User/services/profile.service.js`
- Message services: `src/modules/Messages/services/message.service.js`
- Middlewares: `src/middleware/` (authentication/authorization/validation/error handling)
- Models: `DB/models/`
