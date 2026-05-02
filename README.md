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
```

For production, replace `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`, and `VITE_API_URL` with your deployed values.

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

- Email notifications for booking approval or rejection
- Recurring room reservations
- Advanced room search and filtering
- Report export as CSV or PDF
- User profile management

---

## 📄 License

This project is open source and available under the **MIT License**.
