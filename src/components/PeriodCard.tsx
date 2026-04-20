import { useState } from "react";
import { Button, Modal, Label, Spinner, useOverlayState } from "@heroui/react";
import { Trash2, Pencil } from "lucide-react";
import { ConfirmModal } from "./ConfirmModal";
import type { SchedulePeriod } from "../types/schedule";

export function formatTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, "0")} ${suffix}`;
}

interface PeriodCardProps {
  period: SchedulePeriod;
  onDelete: (id: number) => void;
  onEdit: (id: number, data: { name: string; start_time: string; end_time: string }) => Promise<void>;
  compact?: boolean;
}

export function PeriodCard({ period, onDelete, onEdit, compact = false }: PeriodCardProps) {
  const [confirming, setConfirming] = useState(false);
  const editModalState = useOverlayState();
  const [editForm, setEditForm] = useState({ name: period.name, start_time: period.start_time, end_time: period.end_time });
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const openEdit = () => {
    setEditForm({ name: period.name, start_time: period.start_time, end_time: period.end_time });
    setEditError(null);
    editModalState.open();
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.name.trim()) return;
    setSaving(true);
    setEditError(null);
    try {
      await onEdit(period.id, editForm);
      editModalState.close();
    } catch (err) {
      setEditError(String(err));
    } finally {
      setSaving(false);
    }
  };

  const editModal = (
    <>
      <Modal state={editModalState}>
        <Modal.Backdrop isDismissable={!saving}>
          <Modal.Container>
            <Modal.Dialog>
              <form onSubmit={handleEditSubmit}>
                <Modal.Header>Edit Period</Modal.Header>
                <Modal.Body className="flex flex-col gap-4 pb-px overflow-visible">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="edit-period-name">Period Name *</Label>
                    <input
                      id="edit-period-name"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      required
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                  </div>
                  <div className="flex gap-4">
                    <div className="flex flex-col gap-1.5 flex-1">
                      <Label htmlFor="edit-period-start">Start Time *</Label>
                      <input
                        id="edit-period-start"
                        type="time"
                        value={editForm.start_time}
                        onChange={(e) => setEditForm({ ...editForm, start_time: e.target.value })}
                        required
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5 flex-1">
                      <Label htmlFor="edit-period-end">End Time *</Label>
                      <input
                        id="edit-period-end"
                        type="time"
                        value={editForm.end_time}
                        onChange={(e) => setEditForm({ ...editForm, end_time: e.target.value })}
                        required
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      />
                    </div>
                  </div>
                  {editError && <p className="text-danger text-sm">{editError}</p>}
                </Modal.Body>
                <Modal.Footer>
                  <Button type="button" variant="ghost" onPress={editModalState.close}>Cancel</Button>
                  <Button type="submit" variant="primary" isDisabled={saving}>
                    {saving ? <Spinner size="sm" /> : "Save"}
                  </Button>
                </Modal.Footer>
              </form>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>

      <ConfirmModal
        isOpen={confirming}
        onClose={() => setConfirming(false)}
        onConfirm={() => onDelete(period.id)}
        title="Delete Period"
        description={`Are you sure you want to delete "${period.name}"? This will also remove all attendance records for this period.`}
        confirmLabel="Delete"
      />
    </>
  );

  if (compact) {
    return (
      <>
        <div className="group relative rounded-lg bg-background border border-border/60 px-2.5 py-2 text-xs hover:border-accent/40 transition-colors">
          <div className="font-medium text-foreground truncate pr-8">{period.name}</div>
          <div className="text-foreground/50 mt-0.5 font-mono">
            {formatTime(period.start_time)} – {formatTime(period.end_time)}
          </div>
          <div className="absolute top-1.5 right-1.5 hidden group-hover:flex gap-0.5">
            <button
              type="button"
              onClick={openEdit}
              className="p-0.5 rounded text-foreground/40 hover:text-foreground transition-colors"
              aria-label="Edit period"
            >
              <Pencil size={11} />
            </button>
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="p-0.5 rounded text-foreground/40 hover:text-danger transition-colors"
              aria-label="Delete period"
            >
              <Trash2 size={11} />
            </button>
          </div>
        </div>
        {editModal}
      </>
    );
  }

  return (
    <>
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-background border border-border/60">
        <span className="text-xs font-mono text-foreground/50 w-28 shrink-0">
          {formatTime(period.start_time)} – {formatTime(period.end_time)}
        </span>
        <span className="flex-1 font-medium text-sm">{period.name}</span>
        <button
          type="button"
          onClick={openEdit}
          className="p-1.5 rounded text-foreground/30 hover:text-foreground/70 transition-colors"
          aria-label="Edit period"
        >
          <Pencil size={14} />
        </button>
        <Button
          variant="ghost"
          isIconOnly
          size="sm"
          aria-label="Delete period"
          onPress={() => setConfirming(true)}
        >
          <Trash2 size={14} />
        </Button>
      </div>
      {editModal}
    </>
  );
}
