import { View, Text, StyleSheet } from "@react-pdf/renderer";
import type { Contact } from "../../types/contact";

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
  empty: { fontSize: 8.5, color: "#94a3b8", paddingVertical: 8, paddingHorizontal: 6 },
  hCell: { fontFamily: "Helvetica-Bold", fontSize: 8.5, color: "#374151" },
  cell: { fontSize: 8.5, color: "#374151" },
  cellBold: { fontFamily: "Helvetica-Bold", fontSize: 8.5, color: "#1a202c" },
  badge: { fontSize: 7.5, color: "#4a5568", backgroundColor: "#edf2f7", paddingHorizontal: 3, paddingVertical: 1, borderRadius: 2 },
  colName: { flex: 2.5 },
  colRel: { flex: 1.5 },
  colPhone: { flex: 2 },
  colEmail: { flex: 2.5 },
  colFlags: { flex: 1.5 },
});

interface Props {
  contacts: Contact[];
}

export function ContactsSection({ contacts }: Props) {
  return (
    <View style={S.section}>
      <Text style={S.title}>Family Contacts</Text>
      <View style={S.thead}>
        <Text style={[S.hCell, S.colName]}>Name</Text>
        <Text style={[S.hCell, S.colRel]}>Relationship</Text>
        <Text style={[S.hCell, S.colPhone]}>Phone</Text>
        <Text style={[S.hCell, S.colEmail]}>Email</Text>
        <Text style={[S.hCell, S.colFlags]}>Roles</Text>
      </View>
      {contacts.length === 0 ? (
        <Text style={S.empty}>No contacts recorded.</Text>
      ) : (
        contacts.map((c) => {
          const roles: string[] = [];
          if (c.is_primary_guardian) roles.push("Guardian");
          if (c.is_emergency_contact) roles.push("Emergency");
          return (
            <View key={c.id} style={S.row}>
              <Text style={[S.cellBold, S.colName]}>{c.name}</Text>
              <Text style={[S.cell, S.colRel]}>{c.relationship ?? "—"}</Text>
              <Text style={[S.cell, S.colPhone]}>{c.phone ?? "—"}</Text>
              <Text style={[S.cell, S.colEmail]}>{c.email ?? "—"}</Text>
              <Text style={[S.cell, S.colFlags]}>{roles.join(", ") || "—"}</Text>
            </View>
          );
        })
      )}
    </View>
  );
}
