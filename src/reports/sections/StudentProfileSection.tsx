import { View, Text, StyleSheet } from "@react-pdf/renderer";
import type { Student } from "../../types/student";

const S = StyleSheet.create({
  section: { marginBottom: 28 },
  title: {
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
    color: "#1a202c",
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#cbd5e0",
  },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  field: { width: "50%", marginBottom: 8, paddingRight: 12 },
  label: { fontSize: 7.5, color: "#94a3b8", fontFamily: "Helvetica-Bold", marginBottom: 2, textTransform: "uppercase" },
  value: { fontSize: 9, color: "#1a202c" },
});

function fmt(d: string | null): string {
  if (!d) return "—";
  const [y, m, day] = d.split("-");
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${months[parseInt(m, 10) - 1]} ${parseInt(day, 10)}, ${y}`;
}

interface Props {
  student: Student;
}

export function StudentProfileSection({ student }: Props) {
  const fields: { label: string; value: string }[] = [
    { label: "Full Name", value: student.name },
    { label: "Gender", value: student.gender ?? "—" },
    { label: "Date of Birth", value: fmt(student.birthdate) },
    { label: "Student ID", value: student.student_number ?? "—" },
    { label: "Enrollment Date", value: fmt(student.enrollment_date) },
    { label: "Enrollment End Date", value: fmt(student.enrollment_end_date) },
  ];

  return (
    <View style={S.section}>
      <Text style={S.title}>Student Profile</Text>
      <View style={S.grid}>
        {fields.map((f) => (
          <View key={f.label} style={S.field}>
            <Text style={S.label}>{f.label}</Text>
            <Text style={S.value}>{f.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
