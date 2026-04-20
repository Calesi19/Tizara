import { Button, Modal, Spinner, useOverlayState } from "@heroui/react";
import { useEffect } from "react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description?: string;
  confirmLabel?: string;
  loading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Delete",
  loading = false,
}: ConfirmModalProps) {
  const state = useOverlayState();

  useEffect(() => {
    if (isOpen) state.open();
    else state.close();
  }, [isOpen]);

  const handleConfirm = async () => {
    await onConfirm();
    onClose();
  };

  return (
    <Modal state={state} onOpenChange={(open) => { if (!open) onClose(); }}>
      <Modal.Backdrop isDismissable={!loading}>
        <Modal.Container>
          <Modal.Dialog>
            <Modal.Header>{title}</Modal.Header>
            {description && (
              <Modal.Body className="pb-px">
                <p className="text-sm text-foreground/70">{description}</p>
              </Modal.Body>
            )}
            <Modal.Footer>
              <Button type="button" variant="ghost" isDisabled={loading} onPress={onClose}>
                Cancel
              </Button>
              <Button type="button" variant="danger" isDisabled={loading} onPress={handleConfirm}>
                {loading ? <Spinner size="sm" /> : confirmLabel}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
