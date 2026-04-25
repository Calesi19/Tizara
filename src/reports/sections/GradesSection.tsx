import { View, Text, StyleSheet } from "@react-pdf/renderer";
import type { StudentGradeRow } from "../fetchStudentReportData";
import { translations } from "../../i18n/translations";
import type { Language } from "../../i18n/translations";

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
  cellBold: { fontFamily: "Helvetica-Bold", fontSize: 8.5, color: "#1a202c" },
  colTitle: { flex: 3 },
  colPeriod: { flex: 2 },
  colScore: { flex: 1.5 },
  colMax: { flex: 1.5 },
  colGrade: { flex: 1 },
  gradeA: { color: "#15803d", fontFamily: "Helvetica-Bold" },
  gradeB: { color: "#16a34a", fontFamily: "Helvetica-Bold" },
  gradeC: { color: "#b45309", fontFamily: "Helvetica-Bold" },
  gradeD: { color: "#ea580c", fontFamily: "Helvetica-Bold" },
  gradeF: { color: "#dc2626", fontFamily: "Helvetica-Bold" },
  footer: { paddingTop: 4, paddingHorizontal: 6, fontSize: 8, color: "#94a3b8" },
  empty: { fontSize: 8.5, color: "#94a3b8", paddingVertical: 8, paddingHorizontal: 6 },
});

function gradeLetter(score: number | null, maxScore: number): string {
  if (score === null) return "—";
  const pct = (score / maxScore) * 100;
  if (pct >= 90) return "A";
  if (pct >= 80) return "B";
  if (pct >= 70) return "C";
  if (pct >= 60) return "D";
  return "F";
}

function gradeStyle(grade: string) {
  if (grade === "A") return S.gradeA;
  if (grade === "B") return S.gradeB;
  if (grade === "C") return S.gradeC;
  if (grade === "D") return S.gradeD;
  if (grade === "F") return S.gradeF;
  return {};
}

interface Props {
  grades: StudentGradeRow[];
  periodFilter?: string;
  language: Language;
}

export function GradesSection({ grades, periodFilter, language }: Props) {
  const L = translations[language].reports.pdf;

  const totalGraded = grades.filter((g) => g.score !== null).length;
  const avg =
    totalGraded > 0
      ? grades
          .filter((g) => g.score !== null)
          .reduce((acc, g) => acc + (g.score! / g.maxScore) * 100, 0) / totalGraded
      : null;

  const countLabel = grades.length === 1
    ? L.assignmentCount.replace("{n}", String(grades.length))
    : L.assignmentCountPlural.replace("{n}", String(grades.length));

  return (
    <View style={S.section}>
      <Text style={S.title}>
        {L.grades}{periodFilter ? ` — ${periodFilter}` : ""}
      </Text>
      <View style={S.thead}>
        <Text style={[S.hCell, S.colTitle]}>{L.colAssignment}</Text>
        <Text style={[S.hCell, S.colPeriod]}>{L.colPeriod}</Text>
        <Text style={[S.hCell, S.colScore]}>{L.colScore}</Text>
        <Text style={[S.hCell, S.colMax]}>{L.colMax}</Text>
        <Text style={[S.hCell, S.colGrade]}>{L.colGrade}</Text>
      </View>
      {grades.length === 0 ? (
        <Text style={S.empty}>
          {periodFilter
            ? L.noGradesForPeriod.replace("{period}", periodFilter)
            : L.noGrades}
        </Text>
      ) : (
        grades.map((g, i) => {
          const grade = gradeLetter(g.score, g.maxScore);
          return (
            <View key={i} style={S.row}>
              <Text style={[S.cellBold, S.colTitle]}>{g.assignmentTitle}</Text>
              <Text style={[S.cell, S.colPeriod]}>{g.periodName}</Text>
              <Text style={[S.cell, S.colScore]}>{g.score !== null ? String(g.score) : "—"}</Text>
              <Text style={[S.cell, S.colMax]}>{g.maxScore}</Text>
              <Text style={[S.cell, S.colGrade, gradeStyle(grade)]}>{grade}</Text>
            </View>
          );
        })
      )}
      <Text style={S.footer}>
        {countLabel}
        {avg !== null ? ` · ${L.classAvgLine.replace("{pct}", avg.toFixed(1))}` : ""}
      </Text>
    </View>
  );
}
