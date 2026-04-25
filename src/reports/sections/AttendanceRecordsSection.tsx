import { View, Text, StyleSheet } from "@react-pdf/renderer";
import type { AttendanceRecordRow } from "../fetchStudentReportData";

const S = StyleSheet.create({
  section: { marginBottom: 28 },
  title: {
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
    color: "#1a202c",
    marginBottom: 6,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#cbd5e0",
  },
  thead: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    borderWidth: 0.5,
    borderColor: "#cbd5e0",
    paddingVertical: 5,
    paddingHorizontal: 6,
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderLeftWidth: 0.5,
    borderRightWidth: 0.5,
    borderColor: "#e2e8f0",
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  hCell: { fontFamily: "Helvetica-Bold", fontSize: 8.5, color: "#374151" },
  cell: { fontSize: 8.5, color: "#374151" },
  colDate: { flex: 2 },
  colPeriod: { flex: 2 },
  colStatus: { flex: 1.5 },
  colNotes: { flex: 3 },
  statusPresent: { color: "#15803d" },
  statusAbsent: { color: "#dc2626" },
  statusLate: { color: "#b45309" },
  statusEarly: { color: "#2563eb" },
  footer: { paddingTop: 4, paddingHorizontal: 6, fontSize: 8, color: "#94a3b8" },
  empty: { fontSize: 8.5, color: "#94a3b8", paddingVertical: 8, paddingHorizontal: 6 },
});

const STATUS_LABELS: Record<string, string> = {
  present: "Present",
  absent: "Absent",
  late: "Late",
  early_pickup: "Early Pickup",
};

function fmt(d: string): string {
  const [y, m, day] = d.split("-");
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${months[parseInt(m, 10) - 1]} ${parseInt(day, 10)}, ${y}`;
}

function statusStyle(status: string) {
  if (status === "present") return S.statusPresent;
  if (status === "absent") return S.statusAbsent;
  if (status === "late") return S.statusLate;
  return S.statusEarly;
}

interface Props {
  records: AttendanceRecordRow[];
  dateFrom?: string;
  dateTo?: string;
}

export function AttendanceRecordsSection({ records, dateFrom, dateTo }: Props) {
  const rangeLabel =
    dateFrom || dateTo
      ? ` (${dateFrom ? fmt(dateFrom) : "start"} – ${dateTo ? fmt(dateTo) : "today"})`
      : "";

  return (
    <View style={S.section}>
      <Text style={S.title}>Attendance Records{rangeLabel}</Text>
      <View style={S.thead}>
        <Text style={[S.hCell, S.colDate]}>Date</Text>
        <Text style={[S.hCell, S.colPeriod]}>Period</Text>
        <Text style={[S.hCell, S.colStatus]}>Status</Text>
        <Text style={[S.hCell, S.colNotes]}>Notes</Text>
      </View>
      {records.length === 0 ? (
        <Text style={S.empty}>No attendance records found{rangeLabel ? " for the selected range" : ""}.</Text>
      ) : (
        records.map((r, i) => (
          <View key={i} style={S.row}>
            <Text style={[S.cell, S.colDate]}>{fmt(r.date)}</Text>
            <Text style={[S.cell, S.colPeriod]}>{r.periodName}</Text>
            <Text style={[S.cell, S.colStatus, statusStyle(r.status)]}>
              {STATUS_LABELS[r.status] ?? r.status}
            </Text>
            <Text style={[S.cell, S.colNotes]}>{r.notes ?? "—"}</Text>
          </View>
        ))
      )}
      <Text style={S.footer}>{records.length} record{records.length !== 1 ? "s" : ""}</Text>
    </View>
  );
}
