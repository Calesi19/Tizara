import { View, Text, StyleSheet } from "@react-pdf/renderer";
import type { Address } from "../../types/address";

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
  addresses: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  card: {
    width: "47%",
    borderWidth: 0.5,
    borderColor: "#e2e8f0",
    borderRadius: 4,
    padding: 8,
    marginBottom: 8,
  },
  cardHome: { borderColor: "#93c5fd", backgroundColor: "#eff6ff" },
  cardLabel: { fontFamily: "Helvetica-Bold", fontSize: 9, color: "#1a202c", marginBottom: 3 },
  cardHome_label: { color: "#1d4ed8" },
  homeBadge: { fontSize: 7, color: "#3b82f6", marginBottom: 3 },
  line: { fontSize: 8.5, color: "#374151", marginBottom: 1 },
  empty: { fontSize: 8.5, color: "#94a3b8" },
});

interface Props {
  addresses: Address[];
}

export function AddressesSection({ addresses }: Props) {
  return (
    <View style={S.section}>
      <Text style={S.title}>Addresses</Text>
      {addresses.length === 0 ? (
        <Text style={S.empty}>No addresses recorded.</Text>
      ) : (
        <View style={S.addresses}>
          {addresses.map((a) => {
            const cityLine = [a.city, a.state, a.zip_code].filter(Boolean).join(", ");
            const displayLabel = a.label || (a.is_student_home ? "Home Address" : "Address");
            return (
              <View key={a.id} style={[S.card, a.is_student_home ? S.cardHome : {}]}>
                {a.is_student_home ? (
                  <Text style={S.homeBadge}>HOME ADDRESS</Text>
                ) : null}
                <Text style={[S.cardLabel, a.is_student_home ? S.cardHome_label : {}]}>
                  {displayLabel}
                </Text>
                <Text style={S.line}>{a.street}</Text>
                {cityLine ? <Text style={S.line}>{cityLine}</Text> : null}
                {a.country ? <Text style={S.line}>{a.country}</Text> : null}
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}
