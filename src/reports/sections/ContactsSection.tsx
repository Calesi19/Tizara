import { View, Text, StyleSheet } from "@react-pdf/renderer";
import type { Contact } from "../../types/contact";
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
  empty: { fontSize: 8.5, color: "#94a3b8", paddingVertical: 8, paddingHorizontal: 6 },
  hCell: { fontFamily: "Helvetica-Bold", fontSize: 8.5, color: "#374151" },
  cell: { fontSize: 8.5, color: "#374151" },
  cellBold: { fontFamily: "Helvetica-Bold", fontSize: 8.5, color: "#1a202c" },
  colName: { flex: 2.5 },
  colRel: { flex: 1.5 },
  colPhone: { flex: 2 },
  colEmail: { flex: 2.5 },
  colFlags: { flex: 1.5 },
});

interface Props {
  contacts: Contact[];
  language: Language;
}

export function ContactsSection({ contacts, language }: Props) {
  const L = translations[language].reports.pdf;

  return (
    <View style={S.section}>
      <Text style={S.title}>{L.contacts}</Text>
      <View style={S.thead}>
        <Text style={[S.hCell, S.colName]}>{L.colName}</Text>
        <Text style={[S.hCell, S.colRel]}>{L.colRelationship}</Text>
        <Text style={[S.hCell, S.colPhone]}>{L.colPhone}</Text>
        <Text style={[S.hCell, S.colEmail]}>{L.colEmail}</Text>
        <Text style={[S.hCell, S.colFlags]}>{L.colRoles}</Text>
      </View>
      {contacts.length === 0 ? (
        <Text style={S.empty}>{L.noContacts}</Text>
      ) : (
        contacts.map((c) => {
          const roles: string[] = [];
          if (c.is_primary_guardian) roles.push(L.roleGuardian);
          if (c.is_emergency_contact) roles.push(L.roleEmergency);
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
