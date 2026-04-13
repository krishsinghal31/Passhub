# PassHub (Visitor Pass Management)

## Security analytics functions placement

- `getSecurityDashboard` and `getSecurityActivity` are implemented in:
  - `backend/src/controllers/scancontroller.js`
- They are exposed via:
  - `backend/src/routes/securityrouter.js`

## Environment

### Backend `.env`

```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
JWT_EXPIRES_IN=7d
SUPER_ADMIN_EMAIL=admin@passhub.com
SUPER_ADMIN_PASSWORD=your_password
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your_email
MAIL_PASS=your_app_password
FRONTEND_URL=http://localhost:5173
```

### Frontend `.env`

```env
VITE_API_URL=http://localhost:5000/api
```

## Run

```bash
# backend
cd backend
npm install
npm run dev

# frontend
cd frontend/visitor-pass-frontend
npm install
npm run dev
```

# Passhub
A full stack visitor pass management system
