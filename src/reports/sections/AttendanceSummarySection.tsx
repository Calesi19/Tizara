import { View, Text, StyleSheet } from "@react-pdf/renderer";
import type { AttendanceSummaryRow } from "../fetchGroupReportData";
import { translations } from "../../i18n/translations";
import type { Language } from "../../i18n/translations";

const S = StyleSheet.create({
  section: { marginBottom: 28 },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: 6,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#cbd5e0",
  },
  title: { fontFamily: "Helvetica-Bold", fontSize: 12, color: "#1a202c" },
  dateRange: { fontSize: 8, color: "#94a3b8" },
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
  hCell: { fontFamily: "Helvetica-Bold", fontSize: 8.5, color: "#374151", textAlign: "right" },
  hCellLeft: { fontFamily: "Helvetica-Bold", fontSize: 8.5, color: "#374151" },
  cell: { fontSize: 8.5, color: "#374151", textAlign: "right" },
  cellName: { fontSize: 8.5, fontFamily: "Helvetica-Bold", color: "#1a202c" },
  pctGood: { fontSize: 8.5, color: "#15803d", textAlign: "right" },
  pctWarn: { fontSize: 8.5, color: "#b45309", textAlign: "right" },
  pctBad: { fontSize: 8.5, color: "#dc2626", textAlign: "right" },
  colName: { flex: 4 },
  colNum: { flex: 1.2 },
  colPct: { flex: 1.5 },
  footer: { paddingTop: 4, paddingHorizontal: 6, fontSize: 8, color: "#94a3b8" },
  noData: { fontSize: 9, color: "#94a3b8", paddingVertical: 10, paddingHorizontal: 6 },
});

function pct(num: number, total: number): string {
  if (total === 0) return "—";
  return ((num / total) * 100).toFixed(1) + "%";
}

interface Props {
  rows: AttendanceSummaryRow[];
  dateFrom?: string;
  dateTo?: string;
  language: Language;
}

export function AttendanceSummarySection({ rows, dateFrom, dateTo, language }: Props) {
  const L = translations[language].reports.pdf;
  const hasData = rows.some((r) => r.total > 0);

  let dateLabel = "";
  if (dateFrom && dateTo) dateLabel = `${dateFrom} – ${dateTo}`;
  else if (dateFrom) dateLabel = L.dateFrom.replace("{date}", dateFrom);
  else if (dateTo) dateLabel = L.dateTo.replace("{date}", dateTo);

  const countLabel = rows.length === 1
    ? L.studentCount.replace("{n}", String(rows.length))
    : L.studentCountPlural.replace("{n}", String(rows.length));

  return (
    <View style={S.section}>
      <View style={S.titleRow}>
        <Text style={S.title}>{L.attendanceSummary}</Text>
        {dateLabel ? <Text style={S.dateRange}>{dateLabel}</Text> : null}
      </View>

      {!hasData ? (
        <Text style={S.noData}>{L.noAttendanceData}</Text>
      ) : (
        <>
          <View style={S.thead}>
            <Text style={[S.hCellLeft, S.colName]}>{L.colStudent}</Text>
            <Text style={[S.hCell, S.colNum]}>{L.colPresent}</Text>
            <Text style={[S.hCell, S.colNum]}>{L.colAbsent}</Text>
            <Text style={[S.hCell, S.colNum]}>{L.colLate}</Text>
            <Text style={[S.hCell, S.colNum]}>{L.colPartial}</Text>
            <Text style={[S.hCell, S.colNum]}>{L.colTotal}</Text>
            <Text style={[S.hCell, S.colPct]}>{L.colAttendancePct}</Text>
          </View>
          {rows.map((r) => {
            const attendedDays = r.present + r.late + r.partial;
            const attendancePct = r.total > 0 ? (attendedDays / r.total) * 100 : 0;
            const pctStyle =
              attendancePct >= 90 ? S.pctGood : attendancePct >= 75 ? S.pctWarn : S.pctBad;

            return (
              <View key={r.studentId} style={S.row}>
                <Text style={[S.cellName, S.colName]}>{r.studentName}</Text>
                <Text style={[S.cell, S.colNum]}>{String(r.present)}</Text>
                <Text style={[S.cell, S.colNum]}>{String(r.absent)}</Text>
                <Text style={[S.cell, S.colNum]}>{String(r.late)}</Text>
                <Text style={[S.cell, S.colNum]}>{String(r.partial)}</Text>
                <Text style={[S.cell, S.colNum]}>{String(r.total)}</Text>
                <Text style={[pctStyle, S.colPct]}>{pct(attendedDays, r.total)}</Text>
              </View>
            );
          })}
          <Text style={S.footer}>{countLabel}</Text>
        </>
      )}
    </View>
  );
}
