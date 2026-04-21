export interface Note {
  id: number;
  student_id: number;
  content: string;
  tags: string;
  created_at: string;
}

export interface NewNoteInput {
  content: string;
  tags: string;
}

export type NoteTagKey = "incident" | "positive" | "negative" | "health" | "attendance";

export const NOTE_TAG_KEYS: NoteTagKey[] = ["incident", "positive", "negative", "health", "attendance"];

export const NOTE_TAG_COLORS: Record<NoteTagKey, { chip: string; active: string; inactive: string }> = {
  attendance: {
    chip: "bg-violet-500/15 text-violet-500",
    active: "bg-violet-500/20 text-violet-500 border border-violet-500/40",
    inactive: "border border-border text-foreground/40 hover:border-foreground/20 hover:text-foreground/70",
  },
  incident: {
    chip: "bg-warning/15 text-warning",
    active: "bg-warning/20 text-warning border border-warning/40",
    inactive: "border border-border text-foreground/40 hover:border-foreground/20 hover:text-foreground/70",
  },
  positive: {
    chip: "bg-success/15 text-success",
    active: "bg-success/20 text-success border border-success/40",
    inactive: "border border-border text-foreground/40 hover:border-foreground/20 hover:text-foreground/70",
  },
  negative: {
    chip: "bg-danger/15 text-danger",
    active: "bg-danger/20 text-danger border border-danger/40",
    inactive: "border border-border text-foreground/40 hover:border-foreground/20 hover:text-foreground/70",
  },
  health: {
    chip: "bg-sky-500/15 text-sky-500",
    active: "bg-sky-500/20 text-sky-500 border border-sky-500/40",
    inactive: "border border-border text-foreground/40 hover:border-foreground/20 hover:text-foreground/70",
  },
};

export function parseTags(tags: string): NoteTagKey[] {
  if (!tags) return [];
  return tags.split(",").filter((t): t is NoteTagKey => NOTE_TAG_KEYS.includes(t as NoteTagKey));
}

export function serializeTags(tags: NoteTagKey[]): string {
  return tags.join(",");
}
