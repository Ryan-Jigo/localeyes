# LOCALEYES Backend Setup Instructions

## ✅ Fixed: Proper Backend/Frontend Architecture

The issue was that `nodemailer` only works in Node.js (backend), not in the browser (frontend). I've now created a proper backend server.

## 🚀 Quick Setup (5 minutes):

### 1. **Setup Backend Server**

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create environment file
cp env.example .env

# Edit .env with your Gmail credentials
# GMAIL_USER=your-gmail@gmail.com
# GMAIL_APP_PASSWORD=your-16-character-app-password
```

### 2. **Start Backend Server**

```bash
# In server directory
npm run dev
```

You should see:
```
🚀 LOCALEYES Backend Server running on port 5001
📧 Email service: Configured
🌐 CORS enabled for: http://localhost:8080, http://localhost:3000
```

### 3. **Start Frontend (in separate terminal)**

```bash
# In project root
npm run dev
```

### 4. **Test Email Sending**

1. Login as Authority (PWD department)
2. Mark any issue as "Resolved"
3. Check console for "✅ Email sent successfully"
4. Check the reporter's email inbox!

## 📁 **New File Structure:**

```
local-concern-watch-1/
├── src/                          # Frontend (React)
│   └── lib/
│       ├── frontendEmail.ts      # Calls backend API
│       └── issues.ts             # Updated to use frontend service
└── server/                       # Backend (Node.js)
    ├── email/
    │   └── gmailSMTPEmailService.ts  # Real Gmail SMTP
    ├── routes/
    │   └── sendEmail.ts          # API endpoints
    ├── server.ts                 # Express server
    ├── package.json              # Backend dependencies
    └── env.example               # Environment template
```

## 🔧 **How It Works Now:**

1. **Frontend** calls `frontendEmail.ts` → Makes HTTP request to backend
2. **Backend** receives request → Uses `gmailSMTPEmailService.ts` with nodemailer
3. **Gmail SMTP** sends real email → Success response sent back to frontend

## 🌐 **API Endpoints:**

- `POST /api/send-email` - Send issue resolution email
- `GET /api/test-email` - Test email configuration
- `GET /api/health` - Health check

## 🔒 **Environment Variables:**

**Backend (.env in server/):**
```bash
GMAIL_USER=your-gmail@gmail.com
GMAIL_APP_PASSWORD=your-16-character-app-password
PORT=5000
```

**Frontend (.env in root):**
```bash
REACT_APP_API_URL=http://localhost:5000/api
```

## ✅ **Benefits:**

- ✅ **Real Gmail SMTP** - Works with actual Gmail accounts
- ✅ **No Browser Limitations** - Backend handles email sending
- ✅ **Professional Emails** - HTML templates with LOCALEYES branding
- ✅ **Error Handling** - Proper API responses and logging
- ✅ **CORS Enabled** - Frontend can call backend API
- ✅ **Scalable** - Easy to add more email features

The architecture is now correct and emails will be sent automatically when issues are resolved!
