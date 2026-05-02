export const roomTypes = {
  classroom: "Classroom",
  laboratory: "Laboratory",
  meeting: "Meeting room"
};

export function formatDate(value) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(
    new Date(value)
  );
}

export function statusClass(status) {
  return {
    pending: "border-line bg-canvas text-slate-700",
    approved: "border-emerald-200 bg-emerald-50 text-emerald-800",
    rejected: "border-rose-200 bg-rose-50 text-rose-800"
  }[status];
}
