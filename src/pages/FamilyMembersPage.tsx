import { useState } from "react";
import {
  Button,
  Modal,
  Label,
  Input,
  Spinner,
  TableRoot,
  TableScrollContainer,
  TableContent,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  useOverlayState,
} from "@heroui/react";
import { useFamilyMembers } from "../hooks/useFamilyMembers";
import { Breadcrumb } from "../components/Breadcrumb";
import type { Classroom } from "../types/classroom";
import type { Student } from "../types/student";
import type { NewFamilyMemberInput } from "../types/familyMember";

interface FamilyMembersPageProps {
  student: Student;
  classroom: Classroom;
  onGoToClassrooms: () => void;
  onGoToStudents: () => void;
  onGoToStudentProfile: () => void;
}

const emptyForm: NewFamilyMemberInput = { name: "", relationship: "", phone: "", email: "" };

export function FamilyMembersPage({
  student,
  classroom,
  onGoToClassrooms,
  onGoToStudents,
  onGoToStudentProfile,
}: FamilyMembersPageProps) {
  const { familyMembers, loading, error, addFamilyMember } = useFamilyMembers(student.id);
  const modalState = useOverlayState();
  const [form, setForm] = useState<NewFamilyMemberInput>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const closeModal = () => {
    setForm(emptyForm);
    setAddError(null);
    modalState.close();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSubmitting(true);
    setAddError(null);
    try {
      await addFamilyMember(form);
      setForm(emptyForm);
      modalState.close();
    } catch (err) {
      setAddError(String(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <Breadcrumb
        items={[
          { label: "Classrooms", onClick: onGoToClassrooms },
          { label: classroom.name, onClick: onGoToStudents },
          { label: student.name, onClick: onGoToStudentProfile },
          { label: "Family Members" },
        ]}
      />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Family Members</h2>
          <p className="text-sm text-muted">{student.name}</p>
        </div>
        <Button variant="primary" size="sm" onPress={modalState.open}>
          + Add Family Member
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

      {!loading && !error && familyMembers.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-lg font-semibold text-muted">No family members yet</p>
          <p className="text-sm text-foreground/40 mt-1">
            Click "+ Add Family Member" to add one.
          </p>
        </div>
      )}

      {!loading && familyMembers.length > 0 && (
        <TableRoot variant="primary">
          <TableScrollContainer>
            <TableContent aria-label="Family members" selectionMode="none">
              <TableHeader>
                <TableColumn isRowHeader>Name</TableColumn>
                <TableColumn>Relationship</TableColumn>
                <TableColumn>Phone</TableColumn>
                <TableColumn>Email</TableColumn>
              </TableHeader>
              <TableBody>
                {familyMembers.map((fm) => (
                  <TableRow key={fm.id} id={fm.id}>
                    <TableCell className="font-medium">{fm.name}</TableCell>
                    <TableCell>{fm.relationship ?? <span className="text-foreground/30">—</span>}</TableCell>
                    <TableCell>{fm.phone ?? <span className="text-foreground/30">—</span>}</TableCell>
                    <TableCell>{fm.email ?? <span className="text-foreground/30">—</span>}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </TableContent>
          </TableScrollContainer>
        </TableRoot>
      )}

      <Modal state={modalState}>
        <Modal.Backdrop isDismissable={!submitting}>
          <Modal.Container>
            <Modal.Dialog>
              <form onSubmit={handleSubmit}>
                <Modal.Header>Add Family Member</Modal.Header>
                <Modal.Body className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="fm-name">Name *</Label>
                    <Input
                      id="fm-name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. Maria Doe"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="fm-relationship">Relationship</Label>
                    <Input
                      id="fm-relationship"
                      value={form.relationship}
                      onChange={(e) => setForm({ ...form, relationship: e.target.value })}
                      placeholder="e.g. Mother, Father, Guardian"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="fm-phone">Phone</Label>
                    <Input
                      id="fm-phone"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="e.g. +1 555 000 0000"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="fm-email">Email</Label>
                    <Input
                      id="fm-email"
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="e.g. maria@example.com"
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
