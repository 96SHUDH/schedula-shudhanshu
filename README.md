# Schedula Backend API

A production-ready backend API for **Schedula**, an appointment scheduling platform that allows doctors to manage their availability and patients to book appointments using **STREAM** and **WAVE** scheduling.

---

# Live Deployment

**Backend URL**

https://your-render-url.onrender.com

Example:

https://schedula-shudhanshu.onrender.com

---

# Tech Stack

- NestJS
- TypeScript
- Prisma ORM
- PostgreSQL (Neon)
- JWT Authentication
- Class Validator
- Render (Deployment)

---

# Hosted Database

Database Provider

**Neon PostgreSQL**

The application uses a hosted PostgreSQL database provided by Neon for production deployment.

---

# Deployment Platform

**Render**

The backend is deployed on Render and is publicly accessible.

---

# Environment Variables

The following environment variables are configured securely on Render.

```env
DATABASE_URL=your_neon_database_url
JWT_SECRET=your_secret_key
PORT=10000
```

> Sensitive credentials are stored using Render Environment Variables and are **not hardcoded** in the source code.

---

# Features

## Authentication

- User Signup
- User Login
- JWT Authentication
- Role-Based Authorization
- Doctor Role
- Patient Role

---

## Doctor Module

- Create Doctor Profile
- Get Doctor Profile
- Update Doctor Profile

---

## Patient Module

- Create Patient Profile
- Get Patient Profile
- Update Patient Profile

---

## Availability Management

- Create Recurring Availability
- Create Availability Override
- Update Availability
- Delete Availability
- Get Availability
- Get Availability By Date

Supports

- STREAM Scheduling
- WAVE Scheduling

---

## Appointment Module

- Book Appointment
- View Patient Appointments
- View Doctor Appointments
- Cancel Appointment

---

# API Testing

The deployed APIs have been successfully tested using **Postman**.

Tested APIs include:

```
POST   /auth/signup
POST   /auth/login

POST   /doctor/profile
GET    /doctor/profile
PATCH  /doctor/profile

POST   /patient/profile
GET    /patient/profile
PATCH  /patient/profile

POST   /doctor/availability
GET    /doctor/availability
PATCH  /doctor/availability/:id
DELETE /doctor/availability/:id

POST   /appointments
GET    /appointments/my
GET    /appointments/doctor
PATCH  /appointments/:id/cancel
```

---

# Deployment Checklist

- Backend deployed successfully
- Public URL accessible
- Hosted PostgreSQL database connected
- Environment variables configured
- APIs tested on deployed server
- Production build successful

---

# Local Setup

Clone the repository

```bash
git clone https://github.com/96SHUDH/schedula-shudhanshu.git
```

Install dependencies

```bash
npm install
```

Generate Prisma Client

```bash
npx prisma generate
```

Run database migrations

```bash
npx prisma migrate deploy
```

Start development server

```bash
npm run start:dev
```

---

# Build

```bash
npm run build
```

---

# Production

```bash
npm run start:prod
```

---

# Repository

GitHub Repository

https://github.com/96SHUDH/schedula-shudhanshu

---

# Author

**Shudhanshu Chaubey**

Backend Internship Project

Built using NestJS, Prisma, PostgreSQL, and Render.
