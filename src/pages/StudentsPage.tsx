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
} from "@heroui/react";
import { useStudents } from "../hooks/useStudents";
import { Breadcrumb } from "../components/Breadcrumb";
import type { Classroom } from "../types/classroom";
import type { Student } from "../types/student";

interface StudentsPageProps {
  classroom: Classroom;
  onGoToClassrooms: () => void;
  onSelectStudent: (student: Student) => void;
}

export function StudentsPage({ classroom, onGoToClassrooms, onSelectStudent }: StudentsPageProps) {
  const { students, loading, error, addStudent } = useStudents(classroom.id);
  const modalState = useOverlayState();
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const closeModal = () => {
    setName("");
    setAddError(null);
    modalState.close();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    setAddError(null);
    try {
      await addStudent({ name: name.trim() });
      setName("");
      modalState.close();
    } catch (err) {
      setAddError(String(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 flex flex-col h-full">
      <Breadcrumb
        items={[
          { label: "Classrooms", onClick: onGoToClassrooms },
          { label: classroom.name },
        ]}
      />

      <div className="mb-1">
        <h2 className="text-2xl font-bold">Students</h2>
        <p className="text-sm text-muted">
          {classroom.subject && <span>{classroom.subject} · </span>}
          {classroom.grade && <span>{classroom.grade}</span>}
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
        <Button variant="primary" size="sm" onPress={modalState.open}>
          + Add Student
        </Button>
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

        {!loading && students.length > 0 && (() => {
          const filtered = students.filter((s) =>
            s.name.toLowerCase().includes(search.toLowerCase())
          );
          return (
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
                      selectionMode="none"
                      onRowAction={(key) => {
                        const student = students.find((s) => s.id === key);
                        if (student) onSelectStudent(student);
                      }}
                    >
                      <TableHeader>
                        <TableColumn isRowHeader>#</TableColumn>
                        <TableColumn>Name</TableColumn>
                        <TableColumn>Enrolled</TableColumn>
                      </TableHeader>
                      <TableBody>
                        {filtered.map((s, i) => (
                          <TableRow key={s.id} id={s.id} className="cursor-pointer">
                            <TableCell className="text-foreground/40">{i + 1}</TableCell>
                            <TableCell className="font-medium">{s.name}</TableCell>
                            <TableCell className="text-sm text-foreground/50">
                              {new Date(s.created_at).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </TableContent>
                  </TableScrollContainer>
                </TableRoot>
              )}
            </>
          );
        })()}
      </div>

      <Modal state={modalState}>
        <Modal.Backdrop isDismissable={!submitting}>
          <Modal.Container>
            <Modal.Dialog>
              <form onSubmit={handleSubmit}>
                <Modal.Header>Add Student</Modal.Header>
                <Modal.Body className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="add-student-name">Student Name *</Label>
                    <Input
                      id="add-student-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Jane Doe"
                      required
                    />
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
    </div>
  );
}
