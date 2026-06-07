# LꙪCAL EYES - Civic Issue Reporting Platform

LOCALEYES is a modern, full-stack civic issue reporting and collaboration system. It empowers citizens to report local concerns (like potholes, street light failures, or water leaks) with geolocation and image attachments, and connects them directly with government departments and authorities for swift resolution.

---

## 🚀 Key Features

* **User Authentication & Roles**:
  * **Citizens**: Can report issues, upvote/downvote community concerns, and track their own reports.
  * **Authorities**: Departmental dashboards for PWD, Water Authority, KSEB, Police, Traffic, Waste Management, etc., to manage tickets and verify credibility.
* **Smart Reporting Form**:
  * Automatically reads **GPS Geolocation** coordinates with a manual address fallback.
  * **Visual Proof**: Capture photos directly from a live camera stream or upload files from a device.
  * **Optimized Storage**: Client-side canvas compression downscales images to a maximum of 1024px (JPEG format) to keep uploads under the 5MB request limit.
* **Credibility & Voting System**:
  * Community upvotes and downvotes to prioritize critical issues.
  * Authority credibility votes (**Verify** vs. **Fake** flag) that update the user's community credibility score.
* **Email Notifications (SMTP)**:
  * When an authority changes an issue's status to **Resolved**, the backend automatically dispatches a HTML-formatted email to the reporter utilizing Gmail SMTP.
* **Responsive Dashboard**: Beautiful dark-themed dashboard with clean metrics and charts.

---

## 🛠️ Tech Stack

### Frontend
* **React 18** with **TypeScript** & **Vite**
* **Tailwind CSS** for responsive layout and aesthetics
* **Radix UI** components & **Lucide React** icons
* **Sonner** for push-toast notifications

### Backend
* **Node.js** with **Express** API
* **Nodemailer** for Gmail SMTP notifications
* **SQLite3** for zero-configuration local development

---

## 📁 Project Structure

```
LocalEyes/
├── src/                         # Frontend React Codebase
│   ├── components/              # Reusable UI elements (dialog, inputs, buttons)
│   ├── contexts/                # Authentication State provider
│   ├── lib/                     # API client hooks, image compression helpers
│   ├── pages/                   # User and Authority dashboard views, Login & SignUp
│   ├── types/                   # TypeScript schemas and definitions
│   └── index.css                # Base styles
├── server/                      # Node.js Express API Backend
│   ├── email/                   # Gmail SMTP email service
│   ├── middleware/              # JWT authentication guards
│   ├── routes/                  # Express routes (auth, issues, emails)
│   ├── database-sqlite.js       # SQLite connection & schema seeder
│   ├── server-sqlite.js         # SQLite server entry point
│   └── package.json             # Backend dependencies
├── README.md                    # Core documentation
├── vercel.json                  # Frontend deployment configuration
└── package.json                 # Project scripts (root runner)
```

---

## ⚙️ Setup & Installation

### Prerequisites
* **Node.js** (v18 or higher recommended)
* **npm** or **yarn**

### 1. Repository Configuration
Clone the repository and install dependencies in both the root folder and the server folder:

```bash
# Install root (frontend) dependencies
npm install

# Install server (backend) dependencies
cd server
npm install
cd ..
```

### 2. Environment Configuration

Create a `.env` file in the **root** folder:
```env
VITE_API_URL=http://localhost:3001/api
```

Create a `.env` file in the **`server`** folder:
```env
# Gmail SMTP Configuration
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-character-app-password

# Server Config
PORT=3001
ALLOWED_ORIGINS=http://localhost:8080,http://localhost:3000,http://localhost:5173
```

> [!TIP]
> **How to get a Gmail App Password:**
> 1. Go to your Google Account settings and enable **2-Step Verification**.
> 2. Search for **App passwords** in the search bar.
> 3. Enter a name (e.g., "LocalEyes App") and click **Create**.
> 4. Google will generate a 16-character password (e.g., `abcd efgh ijkl mnop`). Copy and paste this into the `GMAIL_APP_PASSWORD` field in `server/.env`.

---

## 🏃 Running the Application

To run both the backend server and frontend development server concurrently, run the following command in the **root** directory:

```bash
npm run dev:full
```

* The **Frontend** will be running at: `http://localhost:8080/`
* The **Backend** will be running at: `http://localhost:3001/`
* The **Health Check** endpoint is: `http://localhost:3001/api/health`

---

## 🔑 Demo Login Accounts

On first run, the SQLite database is automatically seeded with demo accounts:

### Citizen Demo Profile
* **Email**: `citizen@example.com`
* **Password**: `password123`

### Authority Department Profiles
All demo authority accounts use the password: `authority123`

| Department | Email Login |
| :--- | :--- |
| **PWD** | `pwd@kerala.localeyes.com` |
| **Water Authority** | `water@kerala.localeyes.com` |
| **KSEB** | `kseb@kerala.localeyes.com` |
| **Traffic** | `traffic@kerala.localeyes.com` |
| **Police** | `police@kerala.localeyes.com` |
| **Healthcare** | `health@kerala.localeyes.com` |
| **Waste Management** | `waste@kerala.localeyes.com` |
| **Other** | `other@kerala.localeyes.com` |

---

## 🔒 Security & Data Preservation
* Passwords are encrypted in the SQLite database using **bcryptjs**.
* API requests are guarded with **JWT tokens** and local storage sessions.
* On backend startup, SQLite schemas check for existing columns (like `credibility` and `images`), modifying them safely without wiping your local seed data.