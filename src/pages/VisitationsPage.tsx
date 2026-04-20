import { useState } from "react";
import {
  Button,
  Modal,
  Label,
  Input,
  Spinner,
  useOverlayState,
} from "@heroui/react";
import { useVisitations } from "../hooks/useVisitations";
import { useContacts } from "../hooks/useContacts";
import { Breadcrumb } from "../components/Breadcrumb";
import type { Group } from "../types/group";
import type { Student } from "../types/student";
import type { NewVisitationInput } from "../types/visitation";

interface VisitationsPageProps {
  student: Student;
  group: Group;
  onGoToGroups: () => void;
  onGoToStudents: () => void;
  onGoToStudentProfile: () => void;
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function todayString(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function VisitationsPage({
  student,
  group,
  onGoToGroups,
  onGoToStudents,
  onGoToStudentProfile,
}: VisitationsPageProps) {
  const { visitations, loading, error, addVisitation } = useVisitations(student.id);
  const { contacts } = useContacts(student.id);
  const modalState = useOverlayState();
  const [visitorName, setVisitorName] = useState("");
  const [notes, setNotes] = useState("");
  const [visitedAt, setVisitedAt] = useState(todayString());
  const [submitting, setSubmitting] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const matchedContact = contacts.find(
    (c) => c.name.toLowerCase() === visitorName.trim().toLowerCase()
  );
  const isNewVisitor = visitorName.trim().length > 0 && !matchedContact;

  const closeModal = () => {
    setVisitorName("");
    setNotes("");
    setVisitedAt(todayString());
    setAddError(null);
    modalState.close();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorName.trim()) return;
    setSubmitting(true);
    setAddError(null);
    try {
      const input: NewVisitationInput = {
        contact_id: matchedContact ? matchedContact.id : null,
        visitor_name: visitorName.trim(),
        notes,
        visited_at: visitedAt,
      };
      await addVisitation(input);
      closeModal();
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
          { label: "Groups", onClick: onGoToGroups },
          { label: group.name, onClick: onGoToStudents },
          { label: student.name, onClick: onGoToStudentProfile },
          { label: "Visitations" },
        ]}
      />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Visitations</h2>
          <p className="text-sm text-muted">{student.name}</p>
        </div>
        <Button variant="primary" size="sm" onPress={modalState.open}>
          + Log Visitation
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

      {!loading && !error && visitations.length === 0 && (
        <div className="flex flex-col items-center justify-center flex-1 text-center">
          <p className="text-lg font-semibold text-muted">No visitations yet</p>
          <p className="text-sm text-foreground/40 mt-1">
            Click "+ Log Visitation" to record one.
          </p>
        </div>
      )}

      {!loading && visitations.length > 0 && (
        <div className="flex flex-col gap-3">
          {visitations.map((v) => (
            <div key={v.id} className="rounded-2xl bg-background-secondary p-4 flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">{v.contact_name}</span>
                <span className="text-xs text-muted">{formatDate(v.visited_at)}</span>
              </div>
              {v.notes && (
                <p className="text-sm text-foreground/80 whitespace-pre-wrap mt-1">{v.notes}</p>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal state={modalState}>
        <Modal.Backdrop isDismissable={!submitting}>
          <Modal.Container>
            <Modal.Dialog>
              <form onSubmit={handleSubmit}>
                <Modal.Header>Log Visitation</Modal.Header>
                <Modal.Body className="flex flex-col gap-4 pb-px overflow-visible">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="visitor-name">Visitor *</Label>
                    <input
                      id="visitor-name"
                      list="contacts-list"
                      value={visitorName}
                      onChange={(e) => setVisitorName(e.target.value)}
                      placeholder="Type or select a contact…"
                      required
                      autoComplete="off"
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                    <datalist id="contacts-list">
                      {contacts.map((c) => (
                        <option key={c.id} value={c.name} />
                      ))}
                    </datalist>
                    {isNewVisitor && (
                      <p className="text-xs text-accent">
                        Will create new contact: <strong>{visitorName.trim()}</strong>
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="visit-date">Date</Label>
                    <Input
                      id="visit-date"
                      type="date"
                      value={visitedAt}
                      onChange={(e) => setVisitedAt(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="visit-notes">Notes</Label>
                    <textarea
                      id="visit-notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Teacher observations or notes about the visit…"
                      rows={4}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-accent resize-none"
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
                  <Button type="submit" variant="primary" isDisabled={submitting || !visitorName.trim()}>
                    {submitting ? <Spinner size="sm" /> : "Log"}
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
