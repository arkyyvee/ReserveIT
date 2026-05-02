function downloadBlob(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function csvValue(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

export function exportBookingsCSV(bookings) {
  const rows = [
    ["User", "Room", "Date", "Start Time", "End Time", "Status", "Purpose"],
    ...bookings.map((booking) => [
      booking.user?.name || "",
      booking.room?.name || "",
      new Date(booking.date).toLocaleDateString(),
      booking.startTime,
      booking.endTime,
      booking.status,
      booking.purpose
    ])
  ];

  const csv = rows.map((row) => row.map(csvValue).join(",")).join("\n");
  downloadBlob(csv, "reserveit-bookings.csv", "text/csv;charset=utf-8");
}

export async function exportBookingsPDF(bookings) {
  const { default: jsPDF } = await import("jspdf");
  const doc = new jsPDF();
  const left = 14;
  let y = 18;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("ReserveIT Booking Report", left, y);

  y += 10;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, left, y);

  y += 12;
  doc.setFont("helvetica", "bold");
  doc.text("User", left, y);
  doc.text("Room", 50, y);
  doc.text("Date", 92, y);
  doc.text("Time", 125, y);
  doc.text("Status", 165, y);

  doc.setFont("helvetica", "normal");
  bookings.forEach((booking) => {
    y += 8;
    if (y > 280) {
      doc.addPage();
      y = 18;
    }
    doc.text((booking.user?.name || "-").slice(0, 18), left, y);
    doc.text((booking.room?.name || "-").slice(0, 20), 50, y);
    doc.text(new Date(booking.date).toLocaleDateString(), 92, y);
    doc.text(`${booking.startTime}-${booking.endTime}`, 125, y);
    doc.text(booking.status, 165, y);
  });

  doc.save("reserveit-booking-report.pdf");
}
