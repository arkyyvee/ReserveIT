# ReserveIT

**Smart Room Resource Booking System for classrooms, laboratories, and meeting rooms.**

ReserveIT is a full-stack web application that helps users reserve rooms while giving administrators tools to approve requests, manage rooms, view schedules, and monitor activity logs.

---

## ✨ Features

- 🔐 **JWT Authentication** with admin and user roles
- 🏫 **Room Management** for classrooms, laboratories, and meeting rooms
- 📅 **Room Booking** with date, start time, end time, and purpose
- 🚫 **Conflict Detection** to prevent overlapping reservations
- ✅ **Admin Approval Workflow** for pending, approved, and rejected bookings
- 🗓️ **FullCalendar Schedule View** for approved reservations
- 📊 **Reports and Activity Logs** for system tracking
- 📧 **Email Notifications** for booking requests and approval decisions
- 📄 **CSV and PDF Report Exports** for admin booking reports
- ⏰ **Booking Reminders** for upcoming approved bookings
- 🔁 **Recurring Reservations** for weekly or monthly room usage
- 🔎 **Advanced Room Search** by capacity, type, amenities, and availability
- 👤 **Profile Management** with department details and password updates
- 📈 **Admin Analytics** for utilization and peak-hour insights
- 🔔 **In-app Notifications** for booking updates and reminders
- 🧾 **Audit Log Filtering** by action, entity, and date range
- 🌙 **Dark Mode** using the same design system

---

## 🛠️ Tech Stack

**Frontend**

- React
- Tailwind CSS
- FullCalendar
- Axios
- Lucide React

**Backend**

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs
- Zod
- Nodemailer
- node-cron

---

## 📁 Project Structure

```text
ReserveIT/
├── client/              # React frontend
│   ├── src/
│   ├── package.json
│   └── vite.config.js
│
├── server/              # Node.js backend
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── server.js
│   └── package.json
│
├── .env
├── .gitignore
└── README.md
```

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/ReserveIT.git
cd ReserveIT
```

### 2. Install Backend Dependencies

```bash
cd server
npm install
```

### 3. Install Frontend Dependencies

Open another terminal:

```bash
cd client
npm install
```

---

## 🔑 Environment Variables

Create a `.env` file in the project root:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/reserveit
JWT_SECRET=your_long_random_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
VITE_API_URL=http://localhost:5000/api
EMAIL_NOTIFICATIONS_ENABLED=false
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=ReserveIT <your_email@gmail.com>
```

For production, replace `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`, and `VITE_API_URL` with your deployed values.

Set `EMAIL_NOTIFICATIONS_ENABLED=true` only after adding valid SMTP credentials. For Gmail, use an app password instead of your regular account password.

---

## ▶️ Usage

### Start the Backend

```bash
cd server
npm run dev
```

The backend runs at:

```text
http://localhost:5000/api
```

### Start the Frontend

```bash
cd client
npm run dev
```

The frontend runs at:

```text
http://localhost:5173
```

### Optional: Seed Sample Data

```bash
cd server
npm run seed
```

Sample accounts:

```text
Admin:
Email: admin@reserveit.local
Password: admin123

User:
Email: user@reserveit.local
Password: user123
```

### Email Notifications and Reminders

Email notifications are sent when:

- A user submits a booking request
- An admin approves or rejects a booking
- An approved booking starts within the next hour

The reminder scheduler starts automatically with the backend and checks upcoming bookings every hour.

### Export Reports

Admins can open the **Reports** page and use:

- `Export CSV`
- `Export PDF`

The exported report includes booking user, room, date, time, status, and purpose.

---

## 📅 Booking Logic

ReserveIT prevents double booking by checking room, date, start time, and end time.

A booking conflicts when:

```text
existing.startTime < requested.endTime
AND
existing.endTime > requested.startTime
```

Only `pending` and `approved` bookings block new reservations. Rejected bookings do not block future bookings.

Recurring reservations create multiple pending booking requests from the same form. Each generated date is checked for conflicts before the series is saved.

Admins can drag approved calendar events to reschedule bookings. The backend re-checks conflicts before saving the new time.

---

## 🌐 Deployment

ReserveIT can be deployed by hosting the frontend and backend separately.

Frontend hosting options:

- Netlify
- Render Static Sites
- Cloudflare Pages

Backend hosting options:

- Render
- Railway
- Fly.io

Recommended production environment variables:

```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_long_random_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=https://your-frontend-domain.com
VITE_API_URL=https://your-backend-domain.com/api
EMAIL_NOTIFICATIONS_ENABLED=true
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
SMTP_FROM=ReserveIT <no-reply@your-domain.com>
```

After deploying the backend, update the frontend `VITE_API_URL` value to point to the deployed backend API.

---

## 🧩 Troubleshooting

### MongoDB connection failed

Check that MongoDB is running locally or that your MongoDB Atlas connection string is correct.

### Frontend cannot connect to backend

Confirm that the backend is running and that `VITE_API_URL` points to the correct backend API URL.

### Login does not work

Confirm that:

- The backend server is running
- MongoDB is connected
- The database has user accounts
- `JWT_SECRET` is set correctly

### Frontend build failed

Make sure:

- All frontend dependencies are installed
- `npm run build` works locally inside the `client` folder

---

## 🔮 Future Improvements

- Role invitation flow for creating admin accounts without direct database edits
- Room maintenance blocks for unavailable rooms and equipment servicing
- Department-level booking quotas and approval rules
- More detailed analytics exports for utilization and peak-hour reports
- Notification preferences per user

---

## 📄 License

This project is open source and available under the **MIT License**.
