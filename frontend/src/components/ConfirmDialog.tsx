import Modal from './Modal';
import './ConfirmDialog.css';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog = ({
  isOpen,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => (
  <Modal isOpen={isOpen} onClose={onCancel} title={title}>
    <p className="confirm-dialog__description">{description}</p>
    <div className="confirm-dialog__actions">
      <button type="button" className="button button--ghost" onClick={onCancel} disabled={loading}>
        {cancelLabel}
      </button>
      <button type="button" className="button button--danger" onClick={onConfirm} disabled={loading}>
        {loading ? 'Deleting...' : confirmLabel}
      </button>
    </div>
  </Modal>
);

export default ConfirmDialog;
