<<<<<<< HEAD
# 🎓 College Admission Management ERP

A full-stack **MERN** web application for managing college admissions with real-time seat tracking, quota enforcement, role-based access control, and complete admission workflow.

> **AI Tools Used**: Antigravity AI (Google DeepMind) — used for code scaffolding and boilerplate. All core business logic (quota validation, admission number generation, JWT auth, role-based access) was understood and reviewed by the developer.

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js 18 + React Router v7 + Context API |
| Styling | Plain CSS (Custom Dark Theme) |
| Charts | Recharts |
| Backend | Node.js + Express.js 5 |
| Database | MongoDB + Mongoose 9 |
| Auth | JWT + bcryptjs |
| Dev Server | Vite 5 |

---

## ✨ Features

- ✅ **Role-based login** — Admin, Admission Officer, Management
- ✅ **Master Setup** — Institution → Campus → Department → Program → Quotas
- ✅ **Seat Matrix** — Real-time quota-wise seat counter
- ✅ **Quota Enforcement** — Blocks allocation if quota is full
- ✅ **Applicant Management** — 15-field application form
- ✅ **Seat Allocation** — Government (KCET/COMEDK) and Management flow
- ✅ **Document Verification** — Pending / Submitted / Verified tracking
- ✅ **Fee Tracking** — Admission confirmed only after fee paid
- ✅ **Admission Number** — Unique, auto-generated, immutable
  - Format: `INST/2026/UG/CSE/KCET/0001`
- ✅ **Dashboard** — Total intake, admitted, quota-wise status, pending fees/docs
- ✅ **Context API** — ApplicantContext, MasterContext, AuthContext for global state

---

## 📋 Prerequisites

Make sure you have the following installed before you begin:

| Tool | Version | Download |
|---|---|---|
| Node.js | v18 or higher | https://nodejs.org |
| npm | v8 or higher | Comes with Node.js |
| MongoDB | v6 or higher (local) **OR** MongoDB Atlas (cloud) | https://www.mongodb.com/try/download/community |
| Git | Any recent version | https://git-scm.com |

To verify your installations:
```bash
node -v
npm -v
mongod --version
git --version
```

---

## 🍃 MongoDB Setup — IMPORTANT

> Every person who clones this project must have **MongoDB running on their own machine**.
> The database is not shared — each person seeds their own local copy using `npm run seed`.

Once MongoDB is running, use this in `Backebnd/.env`:

> MongoDB will automatically create the `college_erp` database on first connection. No manual setup needed.



## 📥 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME
```


---

### 2. Backend Setup

Navigate into the backend folder:

```bash
cd Backebnd
```

Install dependencies:

```bash
npm install
```

Create a `.env` file inside the `Backebnd/` folder:

```bash


Open `.env` and add the following:

```env
PORT=5000
MONGO_URI=Yourl_MongoDB_URL
JWT_SECRET=college_erp_super_secret_key_2026
NODE_ENV=development
```

`

Seed the database with demo data (institutions, programs, users):

```bash
npm run seed
```

Start the backend development server:

```bash
npm run dev
```

✅ Backend will be running at: **`http://localhost:5000`**

---

### 3. Frontend Setup

Open a **new terminal** and navigate to the frontend folder from the project root:

```bash
cd Frontend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file inside the `Frontend/` folder:

```bash
# On Windows (Command Prompt)
copy NUL .env

# On Mac/Linux
touch .env
```

Open `.env` and add the following:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend development server:

```bash
npm run dev
```

✅ Frontend will be running at: **`http://localhost:5173`**

---

## 🌐 Open the App

Once both servers are running, open your browser and go to:

```
http://localhost:5173
```

---

## 👤 Demo Login Accounts

After running `npm run seed`, you can log in with these accounts:

| Role | Email | Password | Access |
|---|---|---|---|
| Admin | admin@erp.com | admin123 | Full access — Masters, Users, Dashboard |
| Admission Officer | officer@erp.com | officer123 | Applicants, Seat Allocation, Docs, Fees |
| Management | mgmt@erp.com | mgmt123 | View-only Dashboard |

---

## 🗂️ Project Structure

```
College ERP/
├── Backebnd/                    ← Express.js Backend
│   ├── middleware/
│   │   └── authMiddleware.js    ← JWT protect + role authorize
│   ├── models/                  ← Mongoose schemas
│   │   ├── User.js
│   │   ├── Institution.js
│   │   ├── Campus.js
│   │   ├── Department.js
│   │   ├── Program.js
│   │   └── Applicant.js
│   ├── routes/                  ← Express routes with business logic
│   │   ├── authRoutes.js
│   │   ├── masterRoutes.js
│   │   ├── applicantRoutes.js
│   │   └── dashboardRoutes.js
│   ├── utils/                   ← Admission number generator
│   ├── seeder.js                ← Demo data seeder
│   ├── server.js                ← App entry point
│   └── .env                    ← ⚠️ Not committed to Git
│
├── Frontend/                    ← React + Vite Frontend
│   ├── src/
│   │   ├── api/                 ← Axios client with JWT interceptor
│   │   ├── context/             ← AuthContext, MasterContext, ApplicantContext
│   │   ├── components/          ← Sidebar, Topbar, ProtectedRoute
│   │   ├── pages/               ← All page components
│   │   └── index.css            ← Global design system (dark theme)
│   ├── .env                    ← ⚠️ Not committed to Git
│   └── vite.config.js
│
└── README.md
```

---

## 🔄 Admission Workflow

### Government Flow (KCET / COMEDK)
1. **Create Applicant** → Set quota type as `KCET` or `COMEDK`, enter allotment number
2. **Allocate Seat** → System checks if quota has available seats (blocks if full)
3. **Document Status** → Pending → Submitted → Verified
4. **Fee Status** → Paid
5. **Confirm Admission** → System generates unique admission number

### Management Flow
1. **Create Applicant** → Set quota type as `Management`
2. **Allocate Seat** → Same quota check applies
3. Steps 3–5 are the same as above

---

## 🔑 Key Business Rules

```
1. Quota seats ≤ Intake (validated on save)
2. Seat allocation blocked if quota is full
3. Admission number generated ONCE and never changed
4. Admission confirmed ONLY if fee = Paid
5. Seat counters update in real-time on allocation
6. Admin-only: Masters setup and user management
7. Management role: View-only access to dashboard
```

---

## 🛠️ Available Scripts

### Backend (`Backebnd/`)

| Command | Description |
|---|---|
| `npm run dev` | Start server with nodemon (auto-restart on changes) |
| `npm start` | Start server without nodemon (production) |
| `npm run seed` | Seed demo data into MongoDB |

### Frontend (`Frontend/`)

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |

---

## 📝 Environment Variables Reference

### `Backebnd/.env`

| Variable | Description | Example |
|---|---|---|
| `PORT` | Port the backend server listens on | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/college_erp` |
| `JWT_SECRET` | Secret key for signing JWT tokens | Any long random string |
| `NODE_ENV` | Environment mode | `development` |

### `Frontend/.env`

| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | Base URL of the backend API | `http://localhost:5000/api` |

---

## 📄 License

This project is for educational and demonstration purposes.
=======
# College_ERP
>>>>>>> 8798ebea41de6e8844b0ec2c5600394b7a3e1af9
