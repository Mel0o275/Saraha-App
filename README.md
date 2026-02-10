# Saraha-App — First Phase
## Authentication & OTP Implementation

This phase covers:
- User registration & login
- Email OTP (one-time password) for verification / password reset flows (depending on your design)
- JWT-based authentication (token in headers)
- Secure password handling (hashing)

---

## Tech Stack
- **Node.js + Express**
- **MongoDB + Mongoose**
- **JWT** for auth
- **bcrypt** for password hashing
- **Nodemailer** for sending OTPs

## Phase 2: Profile, Multer Uploads & Google (Gmail) Auth

This phase covers:
- User profile endpoints
- File uploads using Multer (e.g., profile picture)
- Signup / Login with Gmail (Google OAuth)

### Tech Stack (Phase 2)
- **Multer** for file uploads
- **Google OAuth 2.0** (ID Token) for Gmail signup/login

---

### Features (Phase 2)

#### 1) Profile
- Get logged-in user profile (JWT)
- Update user profile data (JWT)
- Upload / update profile picture (JWT)

#### 2) Multer Uploads
- Upload user profile image (with validation)
- Allowed file types: images only (jpg/png/webp)
- Limit file size (recommended)

#### 3) Gmail (Google) Signup/Login
- Register with Google account (first time)
- Login with Google account (existing user)
- Store provider info (e.g., `provider: "google"`)
- Generate access + refresh tokens after Google verification

---
