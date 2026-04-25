import { View, Text, StyleSheet } from "@react-pdf/renderer";
import type { StudentServices } from "../../types/studentServices";

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
  subTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    color: "#374151",
    marginBottom: 5,
    marginTop: 6,
  },
  row: { flexDirection: "row", alignItems: "flex-start", marginBottom: 4 },
  check: { fontSize: 9, width: 14, color: "#15803d" },
  cross: { fontSize: 9, width: 14, color: "#94a3b8" },
  label: { fontSize: 8.5, color: "#374151", flex: 1 },
  fieldRow: { flexDirection: "row", marginBottom: 4 },
  fieldLabel: { fontFamily: "Helvetica-Bold", fontSize: 8.5, color: "#64748b", width: 80 },
  fieldValue: { fontSize: 8.5, color: "#1a202c", flex: 1 },
  noData: { fontSize: 8.5, color: "#94a3b8" },
  twoCol: { flexDirection: "row" },
  col: { flex: 1, paddingRight: 12 },
});

interface Props {
  services: StudentServices | null;
}

const THERAPIES: { key: keyof StudentServices; label: string }[] = [
  { key: "therapy_speech", label: "Speech Therapy" },
  { key: "therapy_occupational", label: "Occupational Therapy" },
  { key: "therapy_psychological", label: "Psychological Therapy" },
  { key: "therapy_physical", label: "Physical Therapy" },
  { key: "therapy_educational", label: "Educational Therapy" },
];

const PLAN_LABELS: Record<string, string> = {
  private: "Private",
  government: "Government",
  none: "None",
};

function CheckRow({ on, label }: { on: boolean; label: string }) {
  return (
    <View style={S.row}>
      <Text style={on ? S.check : S.cross}>{on ? "✓" : "○"}</Text>
      <Text style={S.label}>{label}</Text>
    </View>
  );
}

export function ServicesSection({ services }: Props) {
  if (!services) {
    return (
      <View style={S.section}>
        <Text style={S.title}>Services & Support</Text>
        <Text style={S.noData}>No services information recorded.</Text>
      </View>
    );
  }

  return (
    <View style={S.section}>
      <Text style={S.title}>Services & Support</Text>

      <View style={S.twoCol}>
        <View style={S.col}>
          <Text style={S.subTitle}>Education</Text>
          <CheckRow on={!!services.has_special_education} label="Special Education" />

          <Text style={S.subTitle}>Therapies</Text>
          {THERAPIES.map((t) => (
            <CheckRow key={t.key} on={!!services[t.key]} label={t.label} />
          ))}
        </View>

        <View style={S.col}>
          <Text style={S.subTitle}>Medical</Text>
          <View style={S.fieldRow}>
            <Text style={S.fieldLabel}>Medical Plan</Text>
            <Text style={S.fieldValue}>{PLAN_LABELS[services.medical_plan] ?? services.medical_plan}</Text>
          </View>
          <CheckRow on={!!services.has_treatment} label="Has active treatment" />

          <Text style={S.subTitle}>Allergies</Text>
          <Text style={[S.label, { marginBottom: 6 }]}>{services.allergies || "None"}</Text>

          <Text style={S.subTitle}>Medical Conditions</Text>
          <Text style={S.label}>{services.conditions || "None"}</Text>
        </View>
      </View>
    </View>
  );
}
