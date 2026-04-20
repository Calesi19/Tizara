import { useState } from "react";
import {
  Button,
  Modal,
  Label,
  Input,
  Spinner,
  TableColumn,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableContent,
  TableScrollContainer,
  TableRoot,
  useOverlayState,
  Select,
  ListBox,
  DatePicker,
  DateField,
  Calendar,
  Checkbox,
} from "@heroui/react";
import type { Selection } from "@heroui/react";
import { parseDate } from "@internationalized/date";
import type { DateValue } from "@internationalized/date";
import Database from "@tauri-apps/plugin-sql";
import { useStudents } from "../hooks/useStudents";
import { Breadcrumb } from "../components/Breadcrumb";
import type { Group } from "../types/group";
import type { Student } from "../types/student";

const DB_URL = "sqlite:tizara.db";

interface StudentsPageProps {
  group: Group;
  onGoToGroups: () => void;
  onSelectStudent: (student: Student) => void;
}

export function StudentsPage({ group, onGoToGroups, onSelectStudent }: StudentsPageProps) {
  const { students, loading, error, addStudent } = useStudents(group.id);
  const modalState = useOverlayState();
  const noteModalState = useOverlayState();
  const emptyForm = { name: "", gender: "", birthdate: "", student_number: "", enrollment_date: "" };
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set());
  const [noteContent, setNoteContent] = useState("");
  const [noteSubmitting, setNoteSubmitting] = useState(false);
  const [noteError, setNoteError] = useState<string | null>(null);

  const closeModal = () => {
    setForm(emptyForm);
    setAddError(null);
    modalState.close();
  };

  const closeNoteModal = () => {
    setNoteContent("");
    setNoteError(null);
    noteModalState.close();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSubmitting(true);
    setAddError(null);
    try {
      await addStudent({ ...form, name: form.name.trim() });
      setForm(emptyForm);
      modalState.close();
    } catch (err) {
      setAddError(String(err));
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = students.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const selectedStudents =
    selectedKeys === "all"
      ? filtered
      : filtered.filter((s) => (selectedKeys as Set<number>).has(s.id));

  const hasSelection = selectedStudents.length > 0;

  const handleBulkAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) return;
    setNoteSubmitting(true);
    setNoteError(null);
    try {
      const db = await Database.load(DB_URL);
      await Promise.all(
        selectedStudents.map((s) =>
          db.execute(
            "INSERT INTO student_notes (student_id, content) VALUES (?, ?)",
            [s.id, noteContent.trim()]
          )
        )
      );
      setSelectedKeys(new Set());
      closeNoteModal();
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
          { label: group.name },
        ]}
      />

      <div className="mb-1">
        <h2 className="text-2xl font-bold">Students</h2>
        <p className="text-sm text-muted">
          {group.subject && <span>{group.subject} · </span>}
          {group.grade && <span>{group.grade}</span>}
        </p>
      </div>

      <div className="flex items-center justify-between mt-6 mb-4">
        {!loading && students.length > 0 && (
          <Input
            placeholder="Search students..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
        )}
        <div className="flex items-center gap-2 ml-auto">
          {hasSelection ? (
            <>
              <span className="text-sm text-muted">
                {selectedStudents.length} selected
              </span>
              <Button variant="secondary" size="sm" onPress={noteModalState.open}>
                + Add Note
              </Button>
              <Button variant="ghost" size="sm" onPress={() => setSelectedKeys(new Set())}>
                Clear
              </Button>
            </>
          ) : (
            <Button variant="primary" size="sm" onPress={modalState.open}>
              + Add Student
            </Button>
          )}
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <Spinner size="lg" color="accent" />
        </div>
      )}

      {error && (
        <div role="alert" className="rounded-lg bg-danger/10 text-danger px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="flex-1 flex flex-col min-h-0">
        {!loading && !error && students.length === 0 && (
          <div className="flex flex-col items-center justify-center flex-1 text-center">
            <p className="text-lg font-semibold text-muted">No students yet</p>
            <p className="text-sm text-foreground/40 mt-1">
              Click "+ Add Student" to enroll someone.
            </p>
          </div>
        )}

        {!loading && students.length > 0 && (
          <>
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-1 text-center">
                <p className="text-lg font-semibold text-muted">No results</p>
                <p className="text-sm text-foreground/40 mt-1">No students match "{search}".</p>
              </div>
            ) : (
              <TableRoot variant="primary" className="flex-1 h-full">
                <TableScrollContainer className="h-full">
                  <TableContent
                    aria-label="Students"
                    selectionMode="multiple"
                    selectedKeys={selectedKeys}
                    onSelectionChange={setSelectedKeys}
                    onRowAction={(key) => {
                      const student = students.find((s) => s.id === key);
                      if (student) onSelectStudent(student);
                    }}
                  >
                    <TableHeader>
                      <TableColumn className="pr-0 w-10">
                        <Checkbox aria-label="Select all" slot="selection">
                          <Checkbox.Control>
                            <Checkbox.Indicator />
                          </Checkbox.Control>
                        </Checkbox>
                      </TableColumn>
                      <TableColumn isRowHeader>Name</TableColumn>
                      <TableColumn>Gender</TableColumn>
                      <TableColumn>Birthdate</TableColumn>
                      <TableColumn>Student ID</TableColumn>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((s) => (
                        <TableRow key={s.id} id={s.id} className="cursor-pointer">
                          <TableCell className="pr-0">
                            <Checkbox
                              aria-label={`Select ${s.name}`}
                              slot="selection"
                              variant="secondary"
                            >
                              <Checkbox.Control>
                                <Checkbox.Indicator />
                              </Checkbox.Control>
                            </Checkbox>
                          </TableCell>
                          <TableCell className="font-medium">{s.name}</TableCell>
                          <TableCell className="text-sm text-foreground/50">{s.gender || "—"}</TableCell>
                          <TableCell className="text-sm text-foreground/50">
                            {s.birthdate ? (() => {
                              const birth = new Date(s.birthdate);
                              const today = new Date();
                              let age = today.getFullYear() - birth.getFullYear();
                              const m = today.getMonth() - birth.getMonth();
                              if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
                              return `${birth.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })} (${age})`;
                            })() : "—"}
                          </TableCell>
                          <TableCell className="text-sm text-foreground/40">{s.student_number || "—"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </TableContent>
                </TableScrollContainer>
              </TableRoot>
            )}
          </>
        )}
      </div>

      {/* Add Student modal */}
      <Modal state={modalState}>
        <Modal.Backdrop isDismissable={!submitting}>
          <Modal.Container>
            <Modal.Dialog className="overflow-visible">
              <form onSubmit={handleSubmit}>
                <Modal.Header>Add Student</Modal.Header>
                <Modal.Body className="flex flex-col gap-4 pb-px overflow-visible">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="add-student-name">Student Name *</Label>
                    <Input
                      id="add-student-name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. Jane Doe"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label>Gender</Label>
                    <Select
                      aria-label="Gender"
                      selectedKey={form.gender || null}
                      onSelectionChange={(key) => setForm({ ...form, gender: String(key ?? "") })}
                    >
                      <Select.Trigger>
                        <Select.Value>
                          {({ selectedText, isPlaceholder }) =>
                            isPlaceholder ? "Select gender..." : selectedText
                          }
                        </Select.Value>
                        <Select.Indicator />
                      </Select.Trigger>
                      <Select.Popover>
                        <ListBox>
                          <ListBox.Item id="Male" textValue="Male">Male</ListBox.Item>
                          <ListBox.Item id="Female" textValue="Female">Female</ListBox.Item>
                          <ListBox.Item id="Other" textValue="Other">Other</ListBox.Item>
                        </ListBox>
                      </Select.Popover>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label>Birthdate</Label>
                    <DatePicker
                      className="w-full"
                      aria-label="Birthdate"
                      value={form.birthdate ? parseDate(form.birthdate) : null}
                      onChange={(date: DateValue | null) =>
                        setForm({ ...form, birthdate: date ? date.toString() : "" })
                      }
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
                        <Calendar aria-label="Birthdate">
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
                    <Label htmlFor="add-student-number">Student ID</Label>
                    <Input
                      id="add-student-number"
                      value={form.student_number}
                      onChange={(e) => setForm({ ...form, student_number: e.target.value })}
                      placeholder="e.g. 2024-0001"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label>Enrollment Date</Label>
                    <DatePicker
                      className="w-full"
                      aria-label="Enrollment Date"
                      value={form.enrollment_date ? parseDate(form.enrollment_date) : null}
                      onChange={(date: DateValue | null) =>
                        setForm({ ...form, enrollment_date: date ? date.toString() : "" })
                      }
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
                        <Calendar aria-label="Enrollment Date">
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

                  {addError && (
                    <p className="text-danger text-sm">{addError}</p>
                  )}
                </Modal.Body>
                <Modal.Footer>
                  <Button type="button" variant="ghost" onPress={closeModal}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" isDisabled={submitting}>
                    {submitting ? <Spinner size="sm" /> : "Add"}
                  </Button>
                </Modal.Footer>
              </form>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>

      {/* Bulk Add Note modal */}
      <Modal state={noteModalState}>
        <Modal.Backdrop isDismissable={!noteSubmitting}>
          <Modal.Container>
            <Modal.Dialog>
              <form onSubmit={handleBulkAddNote}>
                <Modal.Header>
                  Add Note to {selectedStudents.length} student{selectedStudents.length !== 1 ? "s" : ""}
                </Modal.Header>
                <Modal.Body className="flex flex-col gap-4 pb-px overflow-visible">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="bulk-note-content">Note *</Label>
                    <textarea
                      id="bulk-note-content"
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
    </div>
  );
}
