import { useState, useCallback } from "react";
import {
  Button,
  Checkbox,
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
import { Pencil } from "lucide-react";
import { useContacts } from "../hooks/useContacts";
import { Breadcrumb } from "../components/Breadcrumb";
import type { Group } from "../types/group";
import type { Student } from "../types/student";
import type { Contact, NewContactInput } from "../types/contact";

interface ContactsPageProps {
  student: Student;
  group: Group;
  onGoToGroups: () => void;
  onGoToStudents: () => void;
  onGoToStudentProfile: () => void;
}

const emptyForm: NewContactInput = { name: "", relationship: "", phone: "", email: "", is_emergency_contact: false };

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [value]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="ml-1.5 inline-flex items-center text-foreground/30 hover:text-foreground/70 transition-colors"
      aria-label="Copy to clipboard"
    >
      {copied ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      )}
    </button>
  );
}

export function ContactsPage({
  student,
  group,
  onGoToGroups,
  onGoToStudents,
  onGoToStudentProfile,
}: ContactsPageProps) {
  const { contacts, loading, error, addContact, updateContact } = useContacts(student.id);
  const modalState = useOverlayState();
  const editModalState = useOverlayState();
  const [form, setForm] = useState<NewContactInput>(emptyForm);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [editForm, setEditForm] = useState<NewContactInput>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);

  const closeModal = () => {
    setForm(emptyForm);
    setAddError(null);
    modalState.close();
  };

  const openEditModal = (contact: Contact) => {
    setEditingContact(contact);
    setEditForm({
      name: contact.name,
      relationship: contact.relationship ?? "",
      phone: contact.phone ?? "",
      email: contact.email ?? "",
      is_emergency_contact: contact.is_emergency_contact === 1,
    });
    setEditError(null);
    editModalState.open();
  };

  const closeEditModal = () => {
    setEditingContact(null);
    setEditForm(emptyForm);
    setEditError(null);
    editModalState.close();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSubmitting(true);
    setAddError(null);
    try {
      await addContact(form);
      setForm(emptyForm);
      modalState.close();
    } catch (err) {
      setAddError(String(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingContact || !editForm.name.trim()) return;
    setSubmitting(true);
    setEditError(null);
    try {
      await updateContact(editingContact.id, editForm);
      closeEditModal();
    } catch (err) {
      setEditError(String(err));
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
          { label: "Contacts" },
        ]}
      />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Contacts</h2>
          <p className="text-sm text-muted">{student.name}</p>
        </div>
        <Button variant="primary" size="sm" onPress={modalState.open}>
          + Add Contact
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
        {!loading && !error && contacts.length === 0 && (
          <div className="flex flex-col items-center justify-center flex-1 text-center">
            <p className="text-lg font-semibold text-muted">No contacts yet</p>
            <p className="text-sm text-foreground/40 mt-1">
              Click "+ Add Contact" to add one.
            </p>
          </div>
        )}

        {!loading && contacts.length > 0 && (
          <TableRoot variant="primary" className="flex-1 h-full">
            <TableScrollContainer className="h-full">
            <TableContent aria-label="Contacts" selectionMode="none">
              <TableHeader>
                <TableColumn isRowHeader>Name</TableColumn>
                <TableColumn>Relationship</TableColumn>
                <TableColumn>Phone</TableColumn>
                <TableColumn>Email</TableColumn>
                <TableColumn>Emergency Contact</TableColumn>
                <TableColumn> </TableColumn>
              </TableHeader>
              <TableBody>
                {contacts.map((contact) => (
                  <TableRow key={contact.id} id={contact.id}>
                    <TableCell className="font-medium">{contact.name}</TableCell>
                    <TableCell>{contact.relationship ?? <span className="text-foreground/30">—</span>}</TableCell>
                    <TableCell>
                      {contact.phone
                        ? <span className="inline-flex items-center">{contact.phone}<CopyButton value={contact.phone} /></span>
                        : <span className="text-foreground/30">—</span>}
                    </TableCell>
                    <TableCell>
                      {contact.email
                        ? <span className="inline-flex items-center">{contact.email}<CopyButton value={contact.email} /></span>
                        : <span className="text-foreground/30">—</span>}
                    </TableCell>
                    <TableCell>{contact.is_emergency_contact ? "Yes" : <span className="text-foreground/30">—</span>}</TableCell>
                    <TableCell>
                      <button
                        type="button"
                        onClick={() => openEditModal(contact)}
                        className="inline-flex items-center text-foreground/30 hover:text-foreground/70 transition-colors"
                        aria-label="Edit contact"
                      >
                        <Pencil size={14} />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </TableContent>
          </TableScrollContainer>
          </TableRoot>
        )}
      </div>

      <Modal state={editModalState}>
        <Modal.Backdrop isDismissable={!submitting}>
          <Modal.Container>
            <Modal.Dialog>
              <form onSubmit={handleEditSubmit}>
                <Modal.Header>Edit Contact</Modal.Header>
                <Modal.Body className="flex flex-col gap-4 pb-px overflow-visible">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="edit-contact-name">Name *</Label>
                    <Input
                      id="edit-contact-name"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      placeholder="e.g. Maria Doe"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="edit-contact-relationship">Relationship</Label>
                    <Input
                      id="edit-contact-relationship"
                      value={editForm.relationship}
                      onChange={(e) => setEditForm({ ...editForm, relationship: e.target.value })}
                      placeholder="e.g. Mother, Counselor, Mentor"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="edit-contact-phone">Phone</Label>
                    <Input
                      id="edit-contact-phone"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      placeholder="e.g. +1 555 000 0000"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="edit-contact-email">Email</Label>
                    <Input
                      id="edit-contact-email"
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      placeholder="e.g. maria@example.com"
                    />
                  </div>
                  <Checkbox
                    isSelected={editForm.is_emergency_contact}
                    onChange={(isSelected) => setEditForm({ ...editForm, is_emergency_contact: isSelected })}
                  >
                    <Checkbox.Control>
                      <Checkbox.Indicator />
                    </Checkbox.Control>
                    <Checkbox.Content>Primary Emergency Contact</Checkbox.Content>
                  </Checkbox>
                  {editError && (
                    <p className="text-danger text-sm">{editError}</p>
                  )}
                </Modal.Body>
                <Modal.Footer>
                  <Button type="button" variant="ghost" onPress={closeEditModal}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" isDisabled={submitting}>
                    {submitting ? <Spinner size="sm" /> : "Save"}
                  </Button>
                </Modal.Footer>
              </form>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>

      <Modal state={modalState}>
        <Modal.Backdrop isDismissable={!submitting}>
          <Modal.Container>
            <Modal.Dialog>
              <form onSubmit={handleSubmit}>
                <Modal.Header>Add Contact</Modal.Header>
                <Modal.Body className="flex flex-col gap-4 pb-px overflow-visible">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="contact-name">Name *</Label>
                    <Input
                      id="contact-name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. Maria Doe"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="contact-relationship">Relationship</Label>
                    <Input
                      id="contact-relationship"
                      value={form.relationship}
                      onChange={(e) => setForm({ ...form, relationship: e.target.value })}
                      placeholder="e.g. Mother, Counselor, Mentor"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="contact-phone">Phone</Label>
                    <Input
                      id="contact-phone"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="e.g. +1 555 000 0000"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="contact-email">Email</Label>
                    <Input
                      id="contact-email"
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="e.g. maria@example.com"
                    />
                  </div>
                  <Checkbox
                    isSelected={form.is_emergency_contact}
                    onChange={(isSelected) => setForm({ ...form, is_emergency_contact: isSelected })}
                  >
                    <Checkbox.Control>
                      <Checkbox.Indicator />
                    </Checkbox.Control>
                    <Checkbox.Content>Primary Emergency Contact</Checkbox.Content>
                  </Checkbox>
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
