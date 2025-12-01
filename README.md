# 🚀 Social App Backend (Node.js + TypeScript + MongoDB + Socket.io + AWS S3)

This project is a **full backend for a social networking application** built with:
- Node.js (Express 5)
- TypeScript
- MongoDB (Mongoose)
- AWS S3 for media uploads
- Socket.io real-time messaging
- JWT Authentication + OAuth (Google)
- GraphQL support

It follows a **modular, scalable architecture** suitable for social platforms, chat systems, and user-generated content apps.

---

## 📌 Features

### 🔐 Authentication & Security
- Email/Password signup + hashed passwords (bcrypt)
- Email confirmation using OTP (with hashed OTP storage)
- Forgot/reset password via OTP
- Login with Google OAuth (google-auth-library)
- JWT Access Token + Refresh Token with Token DB model
- Rate limiting, Helmet, CORS

### 👤 User Module
- User model with:
  - firstname / lastname / username (virtual)
  - slug generator
  - gender / role / provider
  - profile & cover images (S3)
  - friend list
  - soft delete (freezedAt) using Mongoose query hooks

### 💬 Real-Time Chat (Socket.io)
- One-to-one messaging
- Group messaging
- Join room events
- Message broadcasting with acknowledgment callbacks

### ☁️ AWS S3 Uploads
- Upload profile images & covers
- Stream files directly to client
- Generate pre-signed URLs

### 🧩 GraphQL Support
- `/graphql` endpoint
- User schema example (extendable)

---

## 📁 Folder Structure

```bash
src/
 ├── DB/
 │    ├── connection.db.ts
 │    ├── models/
 │    │     └── User.model.ts
 │    └── repository/
 │          └── user.repository.ts
 │
 ├── modules/
 │    ├── auth/
 │    │     ├── auth.service.ts
 │    │     ├── auth.controller.ts
 │    │     ├── auth.validation.ts
 │    │     └── auth.dto.ts
 │    │
 │    ├── user/
 │    │     ├── user.controller.ts
 │    │     ├── user.service.ts
 │    │     └── user.schema.gql.ts
 │    │
 │    ├── post/
 │    ├── chat/
 │    │     ├── chat.service.ts
 │    │     ├── chat.events.ts
 │    │     └── chat.controller.ts
 │    │
 │    └── utils/
 │          ├── security/
 │          ├── email/
 │          ├── otp.ts
 │          ├── response/
 │          ├── multer/
 │          └── token.security.ts
 │
 ├── middleware/
 │     └── validation.middleware.ts
 │
 ├── index.ts
 ├── server.ts
```

## ⚙️ Installation & Running

```bash
git clone https://github.com/FatmaMoataz/Social_App.git

cd Social_App

npm install

config/.env.development  //Add your environment file

npm run start:dev
```

## 🌐 Tech Stack

- Node.js 20

- TypeScript

- Express 5

- MongoDB (Mongoose 8)

- Socket.io 4

- AWS S3 (v3 SDK)

- JWT / OAuth

- Zod validation

- GraphQL

## 📘 API Documentation

You can explore and test all endpoints from the public Postman documentation:

➡️ https://documenter.getpostman.com/view/36839356/2sB3BLj7bg
