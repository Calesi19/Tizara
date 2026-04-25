import { View, Text, StyleSheet } from "@react-pdf/renderer";
import type { StudentServices } from "../../types/studentServices";
import { translations } from "../../i18n/translations";
import type { Language } from "../../i18n/translations";

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
  language: Language;
}

function CheckRow({ on, label }: { on: boolean; label: string }) {
  return (
    <View style={S.row}>
      <Text style={on ? S.check : S.cross}>{on ? "✓" : "○"}</Text>
      <Text style={S.label}>{label}</Text>
    </View>
  );
}

export function ServicesSection({ services, language }: Props) {
  const L = translations[language].reports.pdf;

  const THERAPIES: { key: keyof StudentServices; label: string }[] = [
    { key: "therapy_speech", label: L.therapySpeech },
    { key: "therapy_occupational", label: L.therapyOccupational },
    { key: "therapy_psychological", label: L.therapyPsychological },
    { key: "therapy_physical", label: L.therapyPhysical },
    { key: "therapy_educational", label: L.therapyEducational },
  ];

  const PLAN_LABELS: Record<string, string> = {
    private: L.planPrivate,
    government: L.planGovernment,
    none: L.planNone,
  };

  if (!services) {
    return (
      <View style={S.section}>
        <Text style={S.title}>{L.services}</Text>
        <Text style={S.noData}>{L.noServices}</Text>
      </View>
    );
  }

  return (
    <View style={S.section}>
      <Text style={S.title}>{L.services}</Text>

      <View style={S.twoCol}>
        <View style={S.col}>
          <Text style={S.subTitle}>{L.subEducation}</Text>
          <CheckRow on={!!services.has_special_education} label={L.specialEducation} />

          <Text style={S.subTitle}>{L.subTherapies}</Text>
          {THERAPIES.map((t) => (
            <CheckRow key={t.key} on={!!services[t.key]} label={t.label} />
          ))}
        </View>

        <View style={S.col}>
          <Text style={S.subTitle}>{L.subMedical}</Text>
          <View style={S.fieldRow}>
            <Text style={S.fieldLabel}>{L.medicalPlan}</Text>
            <Text style={S.fieldValue}>{PLAN_LABELS[services.medical_plan] ?? services.medical_plan}</Text>
          </View>
          <CheckRow on={!!services.has_treatment} label={L.hasTreatment} />

          <Text style={S.subTitle}>{L.subAllergies}</Text>
          <Text style={[S.label, { marginBottom: 6 }]}>{services.allergies || L.noneValue}</Text>

          <Text style={S.subTitle}>{L.subConditions}</Text>
          <Text style={S.label}>{services.conditions || L.noneValue}</Text>
        </View>
      </View>
    </View>
  );
}
