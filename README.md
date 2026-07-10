# PassHub 🎫

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Nodemailer](https://img.shields.io/badge/Nodemailer-111111?style=for-the-badge&logo=nodemailer&logoColor=white)](https://nodemailer.com/)

PassHub is an enterprise-grade, secure, full-stack visitor pass management and event ticketing platform. Designed to digitize receptionist check-ins, visitor pass authorizations, host analytics, and automated security workflows. 

---

## 🚀 Key Features

*   **Secure Authentication & RBAC:** Complete Role-Based Access Control (RBAC) system with JWT-based session security for Visitors, Hosts, Receptionists, and Super Administrators.
*   **Dynamic Ticket & Pass Generation:** Generates high-quality graphic visitor cards using HTML Canvas, complete with UUID-linked QR codes.
*   **Custom Ticket Branding:** Event creators can customize passes with distinct background themes, falling back to event images or default gradients.
*   **Optimized Nodemailer Delivery:** Consolidates guest passes and embeds card images directly inside single summary emails (CID inline attachments) to minimize SMTP API overhead and guarantee email client compatibility.
*   **QR Scan Entry System:** Security staff check-in endpoints verify scanned tokens against database records in real-time, enforcing date range and usage limits.
*   **Security Analytics Dashboard:** Real-time metrics and check-in history charts optimized using MongoDB aggregation pipelines and custom index configurations.

---

## 🛠️ Tech Stack

*   **Frontend:** React (Vite), TailwindCSS, Axios, Lucide React icons.
*   **Backend:** Node.js, Express, Mongoose.
*   **Database:** MongoDB.
*   **Services:** Nodemailer (SMTP), QRCode generator.

---

## 📂 Project Structure

```text
├── backend/
│   ├── src/
│   │   ├── config/       # Configurations (Database, Mail config)
│   │   ├── controllers/  # Route controller logic (Auth, Host, Pass, Visitor, Admin)
│   │   ├── middlewares/  # Express middlewares (Authentication, RBAC checks)
│   │   ├── models/       # Mongoose Schemas (User, Place/Event, Pass, Booking)
│   │   ├── routes/       # API Route mappings
│   │   ├── services/     # SMTP Mail dispatch, QR Code generation
│   │   └── templates/    # HTML Email layout templates
│   └── package.json
└── frontend/
    └── visitor-pass-frontend/
        ├── public/
        ├── src/
        │   ├── components/ # Form inputs, layouts, modals
        │   ├── context/    # Global Auth Context
        │   ├── pages/      # Views (Dashboard, Payment, Event Settings)
        │   └── utils/      # Axios API configs, canvas pass image generators
        └── package.json
```

---

## 🔧 Getting Started

### Prerequisites
*   Node.js (v16+)
*   MongoDB Instance (Local or Atlas)
*   SMTP Server details (e.g. Gmail App Password)

### 1. Environment Configurations

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_signing_key
JWT_EXPIRES_IN=7d

# Super Admin Defaults
SUPER_ADMIN_EMAIL=admin@passhub.com
SUPER_ADMIN_PASSWORD=secure_admin_password

# Nodemailer SMTP Configuration
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your_email@gmail.com
MAIL_PASS=your_gmail_app_password
FRONTEND_URL=http://localhost:5173
```

Create a `.env` file in the `frontend/visitor-pass-frontend/` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

---

### 2. Run the Application

#### Step A: Backend Server
```bash
cd backend
npm install
npm run dev
```

#### Step B: Frontend Client
```bash
cd frontend/visitor-pass-frontend
npm install
npm run dev
```

The frontend will run on [http://localhost:5173](http://localhost:5173) and the backend API server on [http://localhost:5000](http://localhost:5000).

---

## 🔒 Security & Optimization Highlights

1.  **Index Optimization:** The MongoDB collection includes compound indexes targeting `host`, `visitDate`, and active status to keep lookup speeds sub-millisecond under load.
2.  **CORS Handling:** Handles remote image sources securely inside Canvas components, supporting CORS fallback configurations for robust cross-origin downloads.
3.  **Buffer Conversions:** Base64 pass images are parsed into binary Node.js Buffers before SMTP transmission, preventing attachment truncation in popular email clients like Gmail.
