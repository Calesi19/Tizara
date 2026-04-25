import { View, Text, StyleSheet } from "@react-pdf/renderer";
import type { Note, NoteTagKey } from "../../types/note";
import { parseTags } from "../../types/note";

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
  noteBlock: {
    borderLeftWidth: 2,
    borderLeftColor: "#e2e8f0",
    paddingLeft: 8,
    marginBottom: 10,
  },
  noteMeta: { flexDirection: "row", alignItems: "center", marginBottom: 3, gap: 6 },
  noteDate: { fontSize: 7.5, color: "#94a3b8", fontFamily: "Helvetica-Bold" },
  tag: {
    fontSize: 7,
    color: "#4a5568",
    backgroundColor: "#edf2f7",
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
    marginRight: 3,
  },
  noteContent: { fontSize: 8.5, color: "#374151", lineHeight: 1.4 },
  empty: { fontSize: 8.5, color: "#94a3b8" },
  footer: { paddingTop: 4, fontSize: 8, color: "#94a3b8" },
});

const TAG_LABELS: Record<NoteTagKey, string> = {
  incident: "Incident",
  positive: "Positive",
  negative: "Negative",
  health: "Health",
  attendance: "Attendance",
  referral: "Referral",
};

function fmtDate(iso: string): string {
  const d = new Date(iso);
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

interface Props {
  notes: Note[];
  tagFilter?: string;
}

export function NotesSection({ notes, tagFilter }: Props) {
  const filterLabel = tagFilter ? TAG_LABELS[tagFilter as NoteTagKey] ?? tagFilter : null;

  return (
    <View style={S.section}>
      <Text style={S.title}>
        Notes{filterLabel ? ` — ${filterLabel}` : ""}
      </Text>
      {notes.length === 0 ? (
        <Text style={S.empty}>
          {filterLabel ? `No notes tagged "${filterLabel}".` : "No notes recorded."}
        </Text>
      ) : (
        notes.map((note) => {
          const tags = parseTags(note.tags);
          return (
            <View key={note.id} style={S.noteBlock}>
              <View style={S.noteMeta}>
                <Text style={S.noteDate}>{fmtDate(note.created_at)}</Text>
                {tags.map((t) => (
                  <Text key={t} style={S.tag}>{TAG_LABELS[t]}</Text>
                ))}
              </View>
              <Text style={S.noteContent}>{note.content}</Text>
            </View>
          );
        })
      )}
      <Text style={S.footer}>
        {notes.length} note{notes.length !== 1 ? "s" : ""}
        {filterLabel ? ` matching "${filterLabel}"` : ""}
      </Text>
    </View>
  );
}
