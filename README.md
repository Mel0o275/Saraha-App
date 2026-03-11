# Saraha App (Saraha Clone) — API + Reset Password UI

Anonymous messaging app backend (Node.js/Express) with authentication, OTP flows, profile sharing, uploads, and admin-only analytics. The repo also includes a small React/Vite UI for the password reset flow.

## Features

- **Auth**: Email/password signup & login, JWT access/refresh, logout, rotate refresh token
- **OTP**: Verify email / login confirmation / resend OTP, enable & confirm 2FA
- **Google Sign-in**: Signup/login with Google ID token
- **Profiles**: Get profile, share profile, upload profile/cover images, delete profile picture
- **Messages**: Send anonymous messages (supports optional auth), list messages, get by id, delete
- **Admin**: List users, get a user by id, view profile visit count (admin-only)

## Tech stack

- **Backend**: Node.js, Express, MongoDB (Mongoose), Redis
- **Security**: JWT, bcrypt, Helmet, rate limiting
- **Email**: Nodemailer
- **Uploads**: Multer
- **Frontend (reset flow)**: React + Vite

## Repo structure

- **API**: `src/` (entry: `src/main.js`)
- **Environment files**: `config/` (loaded from `config/.env.dev` in development)
- **Reset password UI**: `reset-password-vite/`

## Prerequisites

- **Node.js**: recent LTS recommended
- **MongoDB**: running locally or a remote connection string
- **Redis**: running locally or a managed Redis URL

### Backend (API)

```bash
npm install
npm run dev
```

API starts on `http://localhost:<PORT>` and serves a basic health response at `GET /`.

### Frontend (Reset password UI)

```bash
cd reset-password-vite
npm install
npm run dev
```

## API overview

Base URL: `http://localhost:<PORT>`

### Auth (`/users`)

- `POST /users/signup`
- `POST /users/verify-otp`
- `POST /users/resend-otp`
- `POST /users/login`
- `POST /users/login-confirm`
- `POST /users/signup/gmail`
- `POST /users/login/gmail`
- `POST /users/forget-pass`
- `POST /users/reset-pass`
- `POST /users/enable-2fa` (auth)
- `POST /users/confirm-2fa` (auth)

### Users (`/users`)

- `GET /users/profile` (auth)
- `GET /users/:userId/profile-share` (auth)
- `PATCH /users/uploadProfile` (auth, multipart)
- `PATCH /users/uploadCover` (auth, multipart)
- `DELETE /users/deleteProfilePic` (auth)
- `POST /users/logout` (auth)
- `PATCH /users/updatePassword` (auth)
- `GET /users/rotate` (refresh token auth)
- `GET /users/views?userId=<id>` (auth + admin)

### Messages (`/message`)

- `GET /message` (auth)
- `GET /message/:messageId` (auth)
- `DELETE /message/:messageId` (auth)
- `POST /message/:reciverId` (optional auth, multipart supported)

### Admin (`/admin`)

- `GET /admin/allUsers` (auth + admin)
- `GET /admin/:userId` (auth + admin)

## Notes

- **Auth header**: this API expects a token in the `Authorization` header.
- **Uploads**: profile uses `image` field; cover uses `cover` (array); messages use `image` (array).
