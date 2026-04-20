import { useState } from "react";
import {
  Avatar, Card, Chip, Surface, ListBox, Spinner, Tabs,
  Button, Modal, Label, Input, Select, useOverlayState,
  DatePicker, DateField, Calendar,
  TableRoot, TableScrollContainer, TableContent, TableHeader, TableColumn, TableBody, TableRow, TableCell,
} from "@heroui/react";
import { parseDate } from "@internationalized/date";
import type { DateValue } from "@internationalized/date";
import { Breadcrumb } from "../components/Breadcrumb";
import { useContacts } from "../hooks/useContacts";
import { useNotes } from "../hooks/useNotes";
import { useVisitations } from "../hooks/useVisitations";
import { useStudentAssignmentPreviews } from "../hooks/useStudentAssignmentPreviews";
import type { Group } from "../types/group";
import type { Student } from "../types/student";

interface StudentProfilePageProps {
  student: Student;
  group: Group;
  onGoToGroups: () => void;
  onGoToStudents: () => void;
  onGoToContacts: () => void;
}

function InfoField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted uppercase tracking-wide">{label}</span>
      <span className="text-sm font-medium text-foreground">{value ?? <span className="text-foreground/30">—</span>}</span>
    </div>
  );
}

function getAge(birthdate: string): number {
  const birth = new Date(birthdate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function formatNoteTimestamp(dateStr: string): string {
  return new Date(dateStr).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatVisitDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function StudentProfilePage({
  student,
  group,
  onGoToGroups,
  onGoToStudents,
  onGoToContacts,
}: StudentProfilePageProps) {
  const todayDateValue = (): DateValue => {
    const d = new Date();
    return parseDate(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`);
  };

  const [activeTab, setActiveTab] = useState("overview");

  const noteModalState = useOverlayState();
  const [noteContent, setNoteContent] = useState("");
  const [noteSubmitting, setNoteSubmitting] = useState(false);
  const [noteError, setNoteError] = useState<string | null>(null);

  const visitationModalState = useOverlayState();
  const [selectedVisitorKey, setSelectedVisitorKey] = useState<string | null>(null);
  const [newVisitorName, setNewVisitorName] = useState("");
  const [visitNotes, setVisitNotes] = useState("");
  const [visitedAt, setVisitedAt] = useState<DateValue | null>(todayDateValue());
  const [visitSubmitting, setVisitSubmitting] = useState(false);
  const [visitError, setVisitError] = useState<string | null>(null);

  const [assignmentSearch, setAssignmentSearch] = useState("");
  const [assignmentPeriodFilter, setAssignmentPeriodFilter] = useState("all");
  const [noteSearch, setNoteSearch] = useState("");
  const [visitationSearch, setVisitationSearch] = useState("");

  const { contacts, loading: loadingContacts } = useContacts(student.id);
  const { notes, loading: loadingNotes, addNote } = useNotes(student.id);
  const { visitations, loading: loadingVisitations, addVisitation } = useVisitations(student.id);
  const { previews: assignments, loading: loadingAssignments } = useStudentAssignmentPreviews(student.id, group.id);

  const assignmentPeriods = Array.from(new Set(assignments.map((a) => a.period_name))).sort();
  const filteredAssignments = assignments.filter((a) => {
    const matchesSearch = a.title.toLowerCase().includes(assignmentSearch.toLowerCase());
    const matchesPeriod = assignmentPeriodFilter === "all" || a.period_name === assignmentPeriodFilter;
    return matchesSearch && matchesPeriod;
  });
  const filteredNotes = notes.filter((n) =>
    n.content.toLowerCase().includes(noteSearch.toLowerCase())
  );
  const filteredVisitations = visitations.filter((v) =>
    v.contact_name.toLowerCase().includes(visitationSearch.toLowerCase())
  );

  const isNewVisitor = selectedVisitorKey === "new";
  const matchedContact = selectedVisitorKey && selectedVisitorKey !== "new"
    ? contacts.find((c) => String(c.id) === selectedVisitorKey) ?? null
    : null;
  const canSubmitVisitation =
    !visitSubmitting &&
    visitedAt !== null &&
    (isNewVisitor ? newVisitorName.trim().length > 0 : matchedContact !== null);

  const closeVisitationModal = () => {
    setSelectedVisitorKey(null);
    setNewVisitorName("");
    setVisitNotes("");
    setVisitedAt(todayDateValue());
    setVisitError(null);
    visitationModalState.close();
  };

  const handleAddVisitation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmitVisitation || !visitedAt) return;
    setVisitSubmitting(true);
    setVisitError(null);
    try {
      await addVisitation({
        contact_id: matchedContact ? matchedContact.id : null,
        visitor_name: isNewVisitor ? newVisitorName.trim() : (matchedContact?.name ?? ""),
        notes: visitNotes,
        visited_at: visitedAt.toString(),
      });
      closeVisitationModal();
    } catch (err) {
      setVisitError(String(err));
    } finally {
      setVisitSubmitting(false);
    }
  };

  const closeNoteModal = () => {
    setNoteContent("");
    setNoteError(null);
    noteModalState.close();
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) return;
    setNoteSubmitting(true);
    setNoteError(null);
    try {
      await addNote({ content: noteContent.trim() });
      setNoteContent("");
      noteModalState.close();
    } catch (err) {
      setNoteError(String(err));
    } finally {
      setNoteSubmitting(false);
    }
  };

  return (
    <div className="p-6 flex flex-col h-full">
      <Breadcrumb
        items={[
          { label: "Groups", onClick: onGoToGroups },
          { label: group.name, onClick: onGoToStudents },
          { label: student.name },
        ]}
      />

      <Tabs className="flex-1 flex flex-col min-h-0" selectedKey={activeTab} onSelectionChange={(key) => setActiveTab(String(key))}>
        <div className="flex items-end justify-between mb-2">
          <div className="flex items-center gap-4">
            <Avatar size="lg">
              <Avatar.Fallback className="bg-accent text-white font-semibold">
                {student.name.charAt(0).toUpperCase()}
              </Avatar.Fallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">{student.name}</h2>
              <p className="text-sm text-muted">
                Enrolled {new Date(student.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          <Tabs.ListContainer>
            <Tabs.List aria-label="Student sections">
              <Tabs.Tab id="overview">Overview<Tabs.Indicator /></Tabs.Tab>
              <Tabs.Tab id="assignments">Assignments<Tabs.Indicator /></Tabs.Tab>
              <Tabs.Tab id="visitations">Visitations<Tabs.Indicator /></Tabs.Tab>
              <Tabs.Tab id="notes">Notes<Tabs.Indicator /></Tabs.Tab>
            </Tabs.List>
          </Tabs.ListContainer>
        </div>

        <Tabs.Panel className="pt-4 flex-1 overflow-y-auto" id="overview">
          <div className="flex flex-col gap-4">
            <Surface variant="secondary" className="rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-muted uppercase tracking-wide mb-4">Student Info</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
                <InfoField label="Student ID" value={student.student_number} />
                <InfoField label="Gender" value={student.gender} />
                <InfoField
                  label="Birthdate"
                  value={
                    student.birthdate
                      ? new Date(student.birthdate).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
                      : null
                  }
                />
                <InfoField
                  label="Age"
                  value={student.birthdate ? `${getAge(student.birthdate)} years old` : null}
                />
                <InfoField
                  label="Enrollment Date"
                  value={
                    student.enrollment_date
                      ? new Date(student.enrollment_date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
                      : null
                  }
                />
              </div>
            </Surface>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card variant="secondary">
                <Card.Header>
                  <Card.Title className="text-base">Group</Card.Title>
                </Card.Header>
                <Card.Content>
                  <p className="font-medium">{group.name}</p>
                  <div className="flex gap-2 mt-1">
                    {group.subject && (
                      <Chip variant="secondary" color="accent" size="sm">{group.subject}</Chip>
                    )}
                    {group.grade && (
                      <Chip variant="tertiary" size="sm">{group.grade}</Chip>
                    )}
                  </div>
                </Card.Content>
              </Card>

              <Surface variant="secondary" className="rounded-2xl p-5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-muted uppercase tracking-wide">Contacts</h3>
                  <button type="button" onClick={onGoToContacts} className="text-xs text-accent hover:underline">
                    View all →
                  </button>
                </div>
                {loadingContacts ? (
                  <div className="flex justify-center py-4"><Spinner size="sm" color="accent" /></div>
                ) : contacts.length === 0 ? (
                  <p className="text-sm text-foreground/40">No contacts added yet.</p>
                ) : (
                  <ListBox aria-label="Contacts" selectionMode="none">
                    {contacts.slice(0, 3).map((contact) => (
                      <ListBox.Item key={contact.id} id={contact.id} textValue={contact.name}>
                        <div className="flex flex-col py-0.5">
                          <span className="text-sm font-medium">
                            {contact.name}
                            {contact.is_emergency_contact ? (
                              <span className="ml-2 text-xs text-accent font-normal">Emergency Contact</span>
                            ) : null}
                          </span>
                          {contact.relationship && (
                            <span className="text-xs text-muted">{contact.relationship}</span>
                          )}
                        </div>
                      </ListBox.Item>
                    ))}
                  </ListBox>
                )}
              </Surface>
            </div>
          </div>
        </Tabs.Panel>

        <Tabs.Panel className="pt-4 flex-1 min-h-0 flex flex-col" id="assignments">
          {loadingAssignments ? (
            <div className="flex justify-center py-12"><Spinner size="lg" color="accent" /></div>
          ) : assignments.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 text-center">
              <p className="text-lg font-semibold text-muted">No assignments yet</p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-4">
                <Input
                  placeholder="Search assignments..."
                  value={assignmentSearch}
                  onChange={(e) => setAssignmentSearch(e.target.value)}
                  className="max-w-xs"
                />
                <Select
                  aria-label="Filter by period"
                  selectedKey={assignmentPeriodFilter}
                  onSelectionChange={(key) => setAssignmentPeriodFilter(String(key))}
                  className="w-44"
                >
                  <Select.Trigger>
                    <Select.Value>
                      {({ selectedText, isPlaceholder }) =>
                        isPlaceholder ? "All periods" : selectedText
                      }
                    </Select.Value>
                    <Select.Indicator />
                  </Select.Trigger>
                  <Select.Popover>
                    <ListBox>
                      <ListBox.Item id="all" textValue="All">All</ListBox.Item>
                      {assignmentPeriods.map((p) => (
                        <ListBox.Item key={p} id={p} textValue={p}>{p}</ListBox.Item>
                      ))}
                    </ListBox>
                  </Select.Popover>
                </Select>
              </div>
              {filteredAssignments.length === 0 ? (
                <div className="flex flex-col items-center justify-center flex-1 text-center">
                  <p className="text-lg font-semibold text-muted">No results</p>
                  <p className="text-sm text-foreground/40 mt-1">No assignments match your filters.</p>
                </div>
              ) : (
                <TableRoot variant="primary" className="flex-1 min-h-0">
                  <TableScrollContainer className="h-full">
                    <TableContent aria-label="Assignments">
                      <TableHeader>
                        <TableColumn isRowHeader>Assignment</TableColumn>
                        <TableColumn>Period</TableColumn>
                        <TableColumn>Score</TableColumn>
                        <TableColumn>Date</TableColumn>
                      </TableHeader>
                      <TableBody>
                        {filteredAssignments.map((a) => (
                          <TableRow key={a.assignment_id} id={a.assignment_id}>
                            <TableCell className="font-medium">{a.title}</TableCell>
                            <TableCell className="text-sm text-foreground/50">{a.period_name}</TableCell>
                            <TableCell className="text-sm">
                              {a.score !== null ? (
                                <span className={a.score > a.max_score ? "text-warning" : "text-foreground"}>
                                  {a.score}
                                </span>
                              ) : (
                                <span className="text-foreground/30">—</span>
                              )}
                              <span className="text-xs text-muted ml-0.5">/ {a.max_score}</span>
                            </TableCell>
                            <TableCell className="text-sm text-foreground/50 whitespace-nowrap">
                              {new Date(a.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </TableContent>
                  </TableScrollContainer>
                </TableRoot>
              )}
            </>
          )}
        </Tabs.Panel>

        <Tabs.Panel className="pt-4 flex-1 min-h-0 flex flex-col gap-4" id="visitations">
          <div className="flex items-center justify-between">
            <Input
              placeholder="Search by visitor name..."
              value={visitationSearch}
              onChange={(e) => setVisitationSearch(e.target.value)}
              className="max-w-xs"
            />
            <Button variant="primary" size="sm" onPress={visitationModalState.open}>
              + Log Visitation
            </Button>
          </div>

          {loadingVisitations ? (
            <div className="flex justify-center py-12"><Spinner size="lg" color="accent" /></div>
          ) : visitations.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 text-center">
              <p className="text-lg font-semibold text-muted">No visitations recorded yet</p>
              <p className="text-sm text-foreground/40 mt-1">Click "+ Log Visitation" to record one.</p>
            </div>
          ) : filteredVisitations.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 text-center">
              <p className="text-lg font-semibold text-muted">No results</p>
              <p className="text-sm text-foreground/40 mt-1">No visitors match "{visitationSearch}".</p>
            </div>
          ) : (
            <TableRoot variant="primary" className="flex-1 min-h-0">
              <TableScrollContainer className="h-full">
                <TableContent aria-label="Visitations">
                  <TableHeader>
                    <TableColumn isRowHeader>Notes</TableColumn>
                    <TableColumn>Visitor</TableColumn>
                    <TableColumn>Relationship</TableColumn>
                    <TableColumn>Date</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {filteredVisitations.map((v) => (
                      <TableRow key={v.id} id={v.id}>
                        <TableCell className="text-sm text-foreground/50">{v.notes || "—"}</TableCell>
                        <TableCell className="font-medium">{v.contact_name}</TableCell>
                        <TableCell className="text-sm text-foreground/50">{v.contact_relationship || "—"}</TableCell>
                        <TableCell className="text-sm text-foreground/50 whitespace-nowrap">{formatVisitDate(v.visited_at)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </TableContent>
              </TableScrollContainer>
            </TableRoot>
          )}
        </Tabs.Panel>

        <Tabs.Panel className="pt-4 flex-1 min-h-0 flex flex-col gap-4" id="notes">
          <div className="flex items-center justify-between">
            <Input
              placeholder="Search notes..."
              value={noteSearch}
              onChange={(e) => setNoteSearch(e.target.value)}
              className="max-w-xs"
            />
            <Button variant="primary" size="sm" onPress={noteModalState.open}>
              + Add Note
            </Button>
          </div>

          {loadingNotes ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" color="accent" />
            </div>
          ) : notes.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 text-center">
              <p className="text-lg font-semibold text-muted">No notes yet</p>
              <p className="text-sm text-foreground/40 mt-1">Click "+ Add Note" to record your first note.</p>
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 text-center">
              <p className="text-lg font-semibold text-muted">No results</p>
              <p className="text-sm text-foreground/40 mt-1">No notes match "{noteSearch}".</p>
            </div>
          ) : (
            <TableRoot variant="primary" className="flex-1 min-h-0">
              <TableScrollContainer className="h-full">
                <TableContent aria-label="Notes">
                  <TableHeader>
                    <TableColumn isRowHeader>Note</TableColumn>
                    <TableColumn>Date</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {filteredNotes.map((note) => (
                      <TableRow key={note.id} id={note.id}>
                        <TableCell className="text-sm text-foreground whitespace-pre-wrap max-w-md">{note.content}</TableCell>
                        <TableCell className="text-sm text-foreground/50 whitespace-nowrap">{formatNoteTimestamp(note.created_at)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </TableContent>
              </TableScrollContainer>
            </TableRoot>
          )}
        </Tabs.Panel>

      </Tabs>

      <Modal state={noteModalState}>
        <Modal.Backdrop isDismissable={!noteSubmitting}>
          <Modal.Container>
            <Modal.Dialog>
              <form onSubmit={handleAddNote}>
                <Modal.Header>Add Note</Modal.Header>
                <Modal.Body className="flex flex-col gap-4 pb-px overflow-visible">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="note-content">Note *</Label>
                    <textarea
                      id="note-content"
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      placeholder="Write your note here..."
                      rows={4}
                      required
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                    />
                  </div>
                  {noteError && <p className="text-danger text-sm">{noteError}</p>}
                </Modal.Body>
                <Modal.Footer>
                  <Button type="button" variant="ghost" onPress={closeNoteModal}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" isDisabled={noteSubmitting || !noteContent.trim()}>
                    {noteSubmitting ? <Spinner size="sm" /> : "Add"}
                  </Button>
                </Modal.Footer>
              </form>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>

      <Modal state={visitationModalState}>
        <Modal.Backdrop isDismissable={!visitSubmitting}>
          <Modal.Container>
            <Modal.Dialog className="overflow-visible">
              <form onSubmit={handleAddVisitation}>
                <Modal.Header>Log Visitation</Modal.Header>
                <Modal.Body className="flex flex-col gap-4 pb-px overflow-visible">
                  <div className="flex flex-col gap-1.5">
                    <Label>Visitor *</Label>
                    <Select
                      aria-label="Visitor"
                      selectedKey={selectedVisitorKey}
                      onSelectionChange={(key) => {
                        setSelectedVisitorKey(key ? String(key) : null);
                        setNewVisitorName("");
                      }}
                    >
                      <Select.Trigger>
                        <Select.Value>
                          {({ isPlaceholder }) =>
                            isPlaceholder ? "Select or add a visitor…" : undefined
                          }
                        </Select.Value>
                        <Select.Indicator />
                      </Select.Trigger>
                      <Select.Popover>
                        <ListBox>
                          {contacts.map((c) => (
                            <ListBox.Item key={c.id} id={String(c.id)} textValue={c.name}>
                              <div className="flex flex-col">
                                <span className="text-sm">{c.name}</span>
                                {c.relationship && (
                                  <span className="text-xs text-foreground/50">{c.relationship}</span>
                                )}
                              </div>
                            </ListBox.Item>
                          ))}
                          <ListBox.Item id="new" textValue="New visitor…">
                            <span className="text-accent text-sm">+ New visitor…</span>
                          </ListBox.Item>
                        </ListBox>
                      </Select.Popover>
                    </Select>
                  </div>

                  {isNewVisitor && (
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="visit-new-name">Visitor Name *</Label>
                      <Input
                        id="visit-new-name"
                        value={newVisitorName}
                        onChange={(e) => setNewVisitorName(e.target.value)}
                        placeholder="e.g. John Smith"
                        autoFocus
                      />
                      <p className="text-xs text-accent">A new contact will be created automatically.</p>
                    </div>
                  )}

                  <div className="flex flex-col gap-1.5">
                    <Label>Date *</Label>
                    <DatePicker
                      className="w-full"
                      aria-label="Visit date"
                      value={visitedAt}
                      onChange={(date: DateValue | null) => setVisitedAt(date)}
                    >
                      <DateField.Group fullWidth>
                        <DateField.Input>
                          {(segment) => <DateField.Segment segment={segment} />}
                        </DateField.Input>
                        <DateField.Suffix>
                          <DatePicker.Trigger>
                            <DatePicker.TriggerIndicator />
                          </DatePicker.Trigger>
                        </DateField.Suffix>
                      </DateField.Group>
                      <DatePicker.Popover>
                        <Calendar aria-label="Visit date">
                          <Calendar.Header>
                            <Calendar.YearPickerTrigger>
                              <Calendar.YearPickerTriggerHeading />
                              <Calendar.YearPickerTriggerIndicator />
                            </Calendar.YearPickerTrigger>
                            <Calendar.NavButton slot="previous" />
                            <Calendar.NavButton slot="next" />
                          </Calendar.Header>
                          <Calendar.Grid>
                            <Calendar.GridHeader>
                              {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
                            </Calendar.GridHeader>
                            <Calendar.GridBody>
                              {(date) => <Calendar.Cell date={date} />}
                            </Calendar.GridBody>
                          </Calendar.Grid>
                          <Calendar.YearPickerGrid>
                            <Calendar.YearPickerGridBody>
                              {({ year }) => <Calendar.YearPickerCell year={year} />}
                            </Calendar.YearPickerGridBody>
                          </Calendar.YearPickerGrid>
                        </Calendar>
                      </DatePicker.Popover>
                    </DatePicker>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="visit-notes">Notes</Label>
                    <textarea
                      id="visit-notes"
                      value={visitNotes}
                      onChange={(e) => setVisitNotes(e.target.value)}
                      placeholder="Teacher observations or notes about the visit…"
                      rows={4}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                    />
                  </div>

                  {visitError && <p className="text-danger text-sm">{visitError}</p>}
                </Modal.Body>
                <Modal.Footer>
                  <Button type="button" variant="ghost" onPress={closeVisitationModal}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" isDisabled={!canSubmitVisitation}>
                    {visitSubmitting ? <Spinner size="sm" /> : "Log"}
                  </Button>
                </Modal.Footer>
              </form>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </div>
  );
}
