import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Bell,
  BookOpenCheck,
  Building2,
  CalendarDays,
  ChevronDown,
  ClipboardList,
  Clock3,
  DoorOpen,
  Download,
  FileText,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
  UserRound,
  X
} from "lucide-react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { api, setAuthToken } from "./api";
import { exportBookingsCSV, exportBookingsPDF } from "./services/exportReports";
import { formatDate, roomTypes, statusClass } from "./utils";

const navItems = [
  { id: "overview", label: "Overview", icon: LayoutDashboard, roles: ["user", "admin"] },
  { id: "rooms", label: "Rooms", icon: DoorOpen, roles: ["user", "admin"] },
  { id: "book", label: "New booking", icon: CalendarDays, roles: ["user", "admin"] },
  { id: "history", label: "Booking history", icon: History, roles: ["user", "admin"] },
  { id: "admin", label: "Admin control", icon: ShieldCheck, roles: ["admin"] },
  { id: "calendar", label: "Calendar", icon: Clock3, roles: ["admin"] },
  { id: "reports", label: "Reports", icon: BarChart3, roles: ["admin"] }
];

const initialBooking = {
  room: "",
  date: "",
  startTime: "08:00",
  endTime: "09:00",
  purpose: ""
};

const initialRoom = {
  name: "",
  type: "classroom",
  location: "",
  capacity: 20,
  amenities: "",
  isActive: true
};

function apiErrorMessage(error, fallback) {
  const data = error.response?.data;
  const details = data?.details
    ? Object.entries(data.details)
        .flatMap(([field, messages]) => messages.map((message) => `${field}: ${message}`))
        .join(" ")
    : "";

  return details || data?.message || fallback;
}

function App() {
  const stored = JSON.parse(localStorage.getItem("reserveit-session") || "null");
  const storedSidebarExpanded = localStorage.getItem("reserveit-sidebar-expanded") === "true";
  const [session, setSession] = useState(stored);
  const [view, setView] = useState("overview");
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(storedSidebarExpanded);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [report, setReport] = useState(null);
  const [logs, setLogs] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setAuthToken(session?.token);
    if (session) {
      refreshData(session.user.role);
    }
  }, [session]);

  async function refreshData(role = session?.user.role) {
    setLoading(true);
    try {
      const [roomRes, bookingRes] = await Promise.all([api.get("/rooms"), api.get("/bookings")]);
      setRooms(roomRes.data);
      setBookings(bookingRes.data);
      if (role === "admin") {
        const [reportRes, logRes] = await Promise.all([api.get("/reports/dashboard"), api.get("/logs")]);
        setReport(reportRes.data);
        setLogs(logRes.data);
      }
    } catch (error) {
      setMessage(apiErrorMessage(error, "Unable to load ReserveIT data."));
    } finally {
      setLoading(false);
    }
  }

  function saveSession(data) {
    localStorage.setItem("reserveit-session", JSON.stringify(data));
    setSession(data);
    setView("overview");
  }

  function logout() {
    localStorage.removeItem("reserveit-session");
    setAuthToken(null);
    setSession(null);
  }

  if (!session) {
    return <AuthScreen onAuth={saveSession} />;
  }

  const visibleNav = navItems.filter((item) => item.roles.includes(session.user.role));
  const activeItem = visibleNav.find((item) => item.id === view) || visibleNav[0];
  const ActiveIcon = activeItem.icon;

  function toggleSidebar() {
    const next = !isSidebarExpanded;
    setIsSidebarExpanded(next);
    localStorage.setItem("reserveit-sidebar-expanded", String(next));
  }

  function changeView(nextView) {
    setView(nextView);
    setIsMobileOpen(false);
  }

  return (
    <div className="min-h-screen bg-canvas text-slate-950">
      <Sidebar
        items={visibleNav}
        activeView={view}
        isExpanded={isSidebarExpanded}
        isMobileOpen={isMobileOpen}
        onToggle={toggleSidebar}
        onCloseMobile={() => setIsMobileOpen(false)}
        onNavigate={changeView}
        onLogout={logout}
      />

      <main className={`app-main ${isSidebarExpanded ? "app-main-expanded" : ""}`}>
        <header className="topbar">
          <div className="flex items-center gap-3">
            <button className="icon-button lg:hidden" onClick={() => setIsMobileOpen(true)} aria-label="Open navigation">
              <Menu size={19} />
            </button>
            <div className="grid h-10 w-10 place-items-center rounded-lg border border-line bg-white text-brand shadow-soft">
              <ActiveIcon size={20} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-brand">ReserveIT workspace</p>
              <h1 className="text-2xl font-bold tracking-tight">{activeItem.label}</h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button className="icon-button" aria-label="Notifications">
              <Bell size={17} />
            </button>
            <span className="badge border-line bg-white text-slate-700">
              <UserRound size={15} />
              {session.user.name}
            </span>
            <span className="badge border-line bg-white capitalize text-slate-700">{session.user.role}</span>
          </div>
        </header>

        <section className="content-shell">
          {message && (
            <div className="mb-5 flex items-center justify-between border border-line bg-white px-4 py-3 text-sm shadow-soft">
              <span>{message}</span>
              <button onClick={() => setMessage("")} className="icon-button" aria-label="Dismiss message">
                <X size={16} />
              </button>
            </div>
          )}
          {loading && <p className="mb-4 text-sm text-slate-600">Loading workspace data...</p>}
          {view === "overview" && (
            <OverviewView
              rooms={rooms}
              bookings={bookings}
              role={session.user.role}
              onNavigate={setView}
            />
          )}
          {view === "rooms" && <RoomsView rooms={rooms} />}
          {view === "book" && <BookingForm rooms={rooms} onSaved={refreshData} setMessage={setMessage} />}
          {view === "history" && <BookingHistory bookings={bookings} />}
          {view === "admin" && (
            <AdminPanel
              rooms={rooms}
              bookings={bookings}
              onSaved={refreshData}
              setMessage={setMessage}
            />
          )}
          {view === "calendar" && <CalendarView bookings={bookings} />}
          {view === "reports" && <ReportsView report={report} logs={logs} bookings={bookings} />}
        </section>
      </main>
    </div>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-11 w-11 place-items-center border border-line bg-brand text-white shadow-soft">
        <Building2 size={24} />
      </div>
      <div>
        <p className="text-lg font-bold leading-none">ReserveIT</p>
        <p className="mt-1 text-sm text-slate-500">Rooms, labs, meetings</p>
      </div>
    </div>
  );
}

function Sidebar({ items, activeView, isExpanded, isMobileOpen, onToggle, onCloseMobile, onNavigate, onLogout }) {
  return (
    <>
      <div className={`sidebar-scrim ${isMobileOpen ? "sidebar-scrim-open" : ""}`} onClick={onCloseMobile} />
      <aside
        className={`sidebar ${isExpanded ? "sidebar-expanded" : ""} ${isMobileOpen ? "sidebar-mobile-open" : ""}`}
      >
        <div className="sidebar-header">
          <div className="sidebar-app-mark" title="ReserveIT">
            <Building2 size={20} />
          </div>
          <div className="sidebar-app-copy">
            <p className="sidebar-app-name">ReserveIT</p>
            <p className="sidebar-app-subtitle">Room booking</p>
          </div>
          <button className="sidebar-icon-button hidden lg:grid" onClick={onToggle} aria-label="Toggle navigation">
            <Menu size={19} />
          </button>
          <button className="icon-button lg:hidden" onClick={onCloseMobile} aria-label="Close navigation">
            <X size={17} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {items.map((item) => (
            <NavButton
              key={item.id}
              item={item}
              active={activeView === item.id}
              expanded={isExpanded}
              onClick={() => onNavigate(item.id)}
            />
          ))}
        </nav>

        <div className="sidebar-bottom">
          <button className="nav-button" onClick={onLogout} title="Sign out" aria-label="Sign out">
            <LogOut size={19} />
            <span className="nav-label">Sign out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

function NavButton({ item, active, expanded, onClick }) {
  return (
    <button
      className={`nav-button ${active ? "nav-button-active" : ""}`}
      onClick={onClick}
      title={expanded ? undefined : item.label}
      aria-label={item.label}
    >
      <item.icon size={20} />
      <span className="nav-label">{item.label}</span>
    </button>
  );
}

function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    setError("");
    try {
      const payload = mode === "login" ? { email: form.email, password: form.password } : form;
      const { data } = await api.post(`/auth/${mode}`, payload);
      onAuth(data);
    } catch (requestError) {
      setError(apiErrorMessage(requestError, "Authentication failed."));
    }
  }

  return (
    <div className="grid min-h-screen bg-canvas lg:grid-cols-[1fr_480px]">
      <section className="flex items-center px-6 py-10 lg:px-16">
        <div className="max-w-3xl">
          <Brand />
          <h1 className="mt-12 text-4xl font-bold leading-tight text-slate-950 lg:text-6xl">
            Reserve rooms with conflict-free scheduling.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            Manage classrooms, laboratories, and meeting rooms with approval workflows, logs, and calendar visibility.
          </p>
        </div>
      </section>
      <section className="flex items-center border-l border-line bg-surface px-6 py-10 shadow-soft">
        <form className="w-full space-y-5" onSubmit={submit}>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-brand">
              {mode === "login" ? "Welcome back" : "Create account"}
            </p>
            <h2 className="mt-1 text-3xl font-bold">{mode === "login" ? "Sign in" : "Register"}</h2>
          </div>
          {mode === "register" && (
            <Field label="Full name" value={form.name} onChange={(name) => setForm({ ...form, name })} />
          )}
          <Field label="Email" type="email" value={form.email} onChange={(email) => setForm({ ...form, email })} />
          <Field
            label="Password"
            type="password"
            value={form.password}
            onChange={(password) => setForm({ ...form, password })}
          />
          {error && <p className="border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">{error}</p>}
          <button className="btn-primary w-full justify-center" type="submit">
            {mode === "login" ? "Sign in" : "Create account"}
          </button>
          <button
            type="button"
            className="w-full text-sm font-semibold text-brand"
            onClick={() => setMode(mode === "login" ? "register" : "login")}
          >
            {mode === "login" ? "Need an account? Register" : "Already registered? Sign in"}
          </button>
        </form>
      </section>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", min }) {
  return (
    <label className="block">
      <span className="form-label">{label}</span>
      <input className="input" type={type} value={value} min={min} onChange={(event) => onChange(event.target.value)} required />
    </label>
  );
}

function SelectField({ label, value, onChange, children, required = true }) {
  return (
    <label className="block">
      <span className="form-label">{label}</span>
      <div className="select-shell">
        <select className="input select-input" value={value} onChange={(event) => onChange(event.target.value)} required={required}>
          {children}
        </select>
        <ChevronDown className="select-icon" size={18} />
      </div>
    </label>
  );
}

function OverviewView({ rooms, bookings, role, onNavigate }) {
  const pending = bookings.filter((booking) => booking.status === "pending").length;
  const approved = bookings.filter((booking) => booking.status === "approved").length;
  const nextBooking = bookings
    .filter((booking) => booking.status === "approved" && new Date(booking.date) >= new Date(new Date().toDateString()))
    .sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`))[0];

  return (
    <div className="space-y-6">
      <SectionTitle icon={LayoutDashboard} title="Workspace overview" subtitle="A quick view of rooms, requests, and upcoming schedules." />
      <div className="grid gap-4 md:grid-cols-3">
        <Metric label="Available rooms" value={rooms.length} />
        <Metric label="Pending requests" value={pending} />
        <Metric label="Approved bookings" value={approved} />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <section className="form-panel">
          <h3 className="panel-title">
            <Bell size={20} />
            Upcoming reminder
          </h3>
          {nextBooking ? (
            <div className="mt-4 request-row">
              <div>
                <p className="font-semibold">{nextBooking.room?.name}</p>
                <p className="text-sm text-slate-600">
                  {formatDate(nextBooking.date)} from {nextBooking.startTime} to {nextBooking.endTime}
                </p>
              </div>
              <span className={`badge capitalize ${statusClass(nextBooking.status)}`}>{nextBooking.status}</span>
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-600">No approved upcoming booking yet.</p>
          )}
        </section>
        <section className="form-panel">
          <h3 className="panel-title">
            <CalendarDays size={20} />
            Quick actions
          </h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <button className="btn-primary" onClick={() => onNavigate("book")}>
              <Plus size={18} />
              New booking
            </button>
            <button className="btn-secondary justify-center" onClick={() => onNavigate(role === "admin" ? "admin" : "history")}>
              <History size={18} />
              {role === "admin" ? "Review queue" : "View history"}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

function RoomsView({ rooms }) {
  return (
    <div>
      <SectionTitle icon={DoorOpen} title="Available rooms" subtitle="Classrooms, laboratories, and meeting spaces." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {rooms.map((room) => (
          <article key={room._id} className="app-card">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-brand">{roomTypes[room.type]}</p>
                <h3 className="mt-1 text-xl font-bold">{room.name}</h3>
              </div>
              <span className="badge border-line bg-white text-slate-700">{room.capacity} seats</span>
            </div>
            <p className="mt-3 text-sm text-slate-600">{room.location}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {room.amenities?.map((amenity) => (
                <span key={amenity} className="badge border-line bg-canvas text-slate-700">
                  {amenity}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function BookingForm({ rooms, onSaved, setMessage }) {
  const [form, setForm] = useState(initialBooking);
  const today = new Date().toISOString().slice(0, 10);

  async function submit(event) {
    event.preventDefault();
    try {
      await api.post("/bookings", form);
      setForm(initialBooking);
      setMessage("Booking request submitted for admin approval.");
      onSaved();
    } catch (error) {
      setMessage(apiErrorMessage(error, "Unable to create booking."));
    }
  }

  return (
    <div>
      <SectionTitle icon={CalendarDays} title="Request a room" subtitle="Choose a time slot and purpose." />
      <form className="form-panel grid gap-4 lg:grid-cols-2" onSubmit={submit}>
        <SelectField label="Room" value={form.room} onChange={(room) => setForm({ ...form, room })}>
          <option value="">Select a room</option>
          {rooms.map((room) => (
            <option key={room._id} value={room._id}>
              {room.name} - {roomTypes[room.type]}
            </option>
          ))}
        </SelectField>
        <Field label="Date" type="date" min={today} value={form.date} onChange={(date) => setForm({ ...form, date })} />
        <Field label="Start time" type="time" value={form.startTime} onChange={(startTime) => setForm({ ...form, startTime })} />
        <Field label="End time" type="time" value={form.endTime} onChange={(endTime) => setForm({ ...form, endTime })} />
        <label className="lg:col-span-2">
          <span className="form-label">Purpose</span>
          <textarea
            className="input min-h-28"
            value={form.purpose}
            onChange={(event) => setForm({ ...form, purpose: event.target.value })}
            required
          />
        </label>
        <button className="btn-primary lg:col-span-2" type="submit">
          <Plus size={18} />
          Submit booking request
        </button>
      </form>
    </div>
  );
}

function BookingHistory({ bookings }) {
  return (
    <div>
      <SectionTitle icon={History} title="Booking history" subtitle="Track pending, approved, and rejected requests." />
      <BookingTable bookings={bookings} />
    </div>
  );
}

function AdminPanel({ rooms, bookings, onSaved, setMessage }) {
  return (
    <div className="space-y-8">
      <SectionTitle icon={LayoutDashboard} title="Admin control" subtitle="Approve requests and manage reservable rooms." />
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <ApprovalQueue bookings={bookings} onSaved={onSaved} setMessage={setMessage} />
        <RoomManager rooms={rooms} onSaved={onSaved} setMessage={setMessage} />
      </div>
    </div>
  );
}

function ApprovalQueue({ bookings, onSaved, setMessage }) {
  const pending = bookings.filter((booking) => booking.status === "pending");

  async function updateStatus(id, status) {
    try {
      await api.patch(`/bookings/${id}/status`, { status });
      setMessage(`Booking ${status}.`);
      onSaved();
    } catch (error) {
      setMessage(apiErrorMessage(error, "Unable to update booking."));
    }
  }

  return (
    <section className="form-panel">
      <h3 className="panel-title">
        <ClipboardList size={20} />
        Booking requests
      </h3>
      <div className="mt-4 space-y-3">
        {pending.length === 0 && <p className="text-sm text-slate-500">No pending requests.</p>}
        {pending.map((booking) => (
          <div key={booking._id} className="request-row">
            <div>
              <p className="font-semibold">{booking.room?.name}</p>
              <p className="text-sm text-slate-600">
                {formatDate(booking.date)} from {booking.startTime} to {booking.endTime}
              </p>
              <p className="mt-1 text-sm text-slate-600">{booking.user?.name}: {booking.purpose}</p>
            </div>
            <div className="flex gap-2">
              <button className="icon-button text-emerald-700" onClick={() => updateStatus(booking._id, "approved")} aria-label="Approve booking">
                <Check size={18} />
              </button>
              <button className="icon-button text-rose-700" onClick={() => updateStatus(booking._id, "rejected")} aria-label="Reject booking">
                <X size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function RoomManager({ rooms, onSaved, setMessage }) {
  const [form, setForm] = useState(initialRoom);
  const [editingId, setEditingId] = useState(null);

  async function saveRoom(event) {
    event.preventDefault();
    try {
      const payload = {
        ...form,
        capacity: Number(form.capacity),
        amenities: form.amenities
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      };
      if (editingId) {
        await api.put(`/rooms/${editingId}`, payload);
      } else {
        await api.post("/rooms", payload);
      }
      setForm(initialRoom);
      setEditingId(null);
      setMessage(editingId ? "Room updated." : "Room added.");
      onSaved();
    } catch (error) {
      setMessage(apiErrorMessage(error, "Unable to save room."));
    }
  }

  function editRoom(room) {
    setEditingId(room._id);
    setForm({
      name: room.name,
      type: room.type,
      location: room.location,
      capacity: room.capacity,
      amenities: room.amenities?.join(", ") || "",
      isActive: room.isActive
    });
  }

  async function removeRoom(id) {
    try {
      await api.delete(`/rooms/${id}`);
      setMessage("Room removed.");
      onSaved();
    } catch (error) {
      setMessage(apiErrorMessage(error, "Unable to delete room."));
    }
  }

  return (
    <section className="form-panel">
      <h3 className="panel-title">
        <BookOpenCheck size={20} />
        Room management
      </h3>
      <form className="mt-4 grid gap-3" onSubmit={saveRoom}>
        <Field label="Room name" value={form.name} onChange={(name) => setForm({ ...form, name })} />
        <SelectField label="Type" value={form.type} onChange={(type) => setForm({ ...form, type })}>
          <option value="classroom">Classroom</option>
          <option value="laboratory">Laboratory</option>
          <option value="meeting">Meeting room</option>
        </SelectField>
        <Field label="Location" value={form.location} onChange={(location) => setForm({ ...form, location })} />
        <Field label="Capacity" type="number" value={form.capacity} onChange={(capacity) => setForm({ ...form, capacity })} />
        <Field label="Amenities, separated by commas" value={form.amenities} onChange={(amenities) => setForm({ ...form, amenities })} />
        <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(event) => setForm({ ...form, isActive: event.target.checked })}
          />
          Active for booking
        </label>
        <button className="btn-primary" type="submit">
          <Plus size={18} />
          {editingId ? "Update room" : "Add room"}
        </button>
        {editingId && (
          <button
            className="btn-secondary justify-center"
            type="button"
            onClick={() => {
              setEditingId(null);
              setForm(initialRoom);
            }}
          >
            Cancel edit
          </button>
        )}
      </form>
      <div className="mt-5 space-y-2">
        {rooms.map((room) => (
          <div key={room._id} className="request-row">
            <span>{room.name}</span>
            <div className="flex gap-2">
              <button className="icon-button text-brand" onClick={() => editRoom(room)} aria-label="Edit room">
                <Pencil size={17} />
              </button>
              <button className="icon-button text-rose-700" onClick={() => removeRoom(room._id)} aria-label="Delete room">
                <Trash2 size={17} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function CalendarView({ bookings }) {
  const events = useMemo(
    () =>
      bookings
        .filter((booking) => booking.status === "approved")
        .map((booking) => ({
          id: booking._id,
          title: booking.room?.name,
          start: `${booking.date.slice(0, 10)}T${booking.startTime}`,
          end: `${booking.date.slice(0, 10)}T${booking.endTime}`
        })),
    [bookings]
  );

  return (
    <div>
      <SectionTitle icon={Clock3} title="Calendar schedule" subtitle="Approved reservations by date and time." />
      <div className="calendar-panel">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{ left: "prev,next today", center: "title", right: "dayGridMonth,timeGridWeek,timeGridDay" }}
          events={events}
          height="auto"
        />
      </div>
    </div>
  );
}

function ReportsView({ report, logs, bookings }) {
  return (
    <div className="space-y-8">
      <SectionTitle icon={BarChart3} title="Reports and logs" subtitle="Usage summaries and recent activity." />
      <div className="flex flex-wrap gap-3">
        <button className="btn-primary" onClick={() => exportBookingsCSV(bookings)}>
          <Download size={18} />
          Export CSV
        </button>
        <button className="btn-secondary" onClick={() => exportBookingsPDF(bookings)}>
          <FileText size={18} />
          Export PDF
        </button>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <Metric label="Rooms" value={report?.rooms || 0} />
        <Metric label="Pending" value={report?.counts?.pending || 0} />
        <Metric label="Approved" value={report?.counts?.approved || 0} />
        <Metric label="Rejected" value={report?.counts?.rejected || 0} />
      </div>
      <section className="form-panel">
        <h3 className="panel-title">
          <ClipboardList size={20} />
          Usage logs
        </h3>
        <div className="mt-4 divide-y divide-line">
          {logs.map((log) => (
            <div key={log._id} className="py-3">
              <p className="font-semibold">{log.action}</p>
              <p className="text-sm text-slate-600">{log.message}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function BookingTable({ bookings }) {
  return (
    <div className="overflow-hidden border border-line bg-white shadow-soft">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-line bg-canvas text-slate-600">
            <tr>
              <th className="px-4 py-3">Room</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Purpose</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {bookings.map((booking) => (
              <tr key={booking._id}>
                <td className="px-4 py-3 font-semibold">{booking.room?.name}</td>
                <td className="px-4 py-3">{formatDate(booking.date)}</td>
                <td className="px-4 py-3">{booking.startTime} - {booking.endTime}</td>
                <td className="px-4 py-3">{booking.purpose}</td>
                <td className="px-4 py-3">
                  <span className={`badge capitalize ${statusClass(booking.status)}`}>{booking.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="app-card">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  );
}

function SectionTitle({ icon: Icon, title, subtitle }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <div className="grid h-11 w-11 place-items-center border border-line bg-white text-brand shadow-soft">
        <Icon size={22} />
      </div>
      <div>
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="text-sm text-slate-600">{subtitle}</p>
      </div>
    </div>
  );
}

export default App;
