import { View, Text, StyleSheet } from "@react-pdf/renderer";
import type { StudentAccommodations } from "../../types/studentAccommodations";

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
  item: { width: "50%", flexDirection: "row", alignItems: "flex-start", marginBottom: 6, paddingRight: 12 },
  check: { fontSize: 9, width: 14, color: "#15803d" },
  cross: { fontSize: 9, width: 14, color: "#94a3b8" },
  label: { fontSize: 8.5, color: "#374151", flex: 1 },
  noData: { fontSize: 8.5, color: "#94a3b8" },
});

const ACCOMMODATIONS: { key: keyof StudentAccommodations; label: string }[] = [
  { key: "desk_placement", label: "Preferential desk placement" },
  { key: "extended_time", label: "Extended time on assignments" },
  { key: "shorter_assignments", label: "Shorter assignments" },
  { key: "use_abacus", label: "Use of abacus or manipulatives" },
  { key: "simple_instructions", label: "Simple, clear instructions" },
  { key: "visual_examples", label: "Visual examples and models" },
];

interface Props {
  accommodations: StudentAccommodations | null;
}

export function AccommodationsSection({ accommodations }: Props) {
  if (!accommodations) {
    return (
      <View style={S.section}>
        <Text style={S.title}>Accommodations</Text>
        <Text style={S.noData}>No accommodations information recorded.</Text>
      </View>
    );
  }

  return (
    <View style={S.section}>
      <Text style={S.title}>Accommodations</Text>
      <View style={S.grid}>
        {ACCOMMODATIONS.map((a) => {
          const on = !!accommodations[a.key];
          return (
            <View key={a.key} style={S.item}>
              <Text style={on ? S.check : S.cross}>{on ? "✓" : "○"}</Text>
              <Text style={S.label}>{a.label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
