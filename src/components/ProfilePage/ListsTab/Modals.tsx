import React from "react";
import { X } from "lucide-react";
import modalStyles from "./Modals.module.css";

interface EditListModalProps {
  isOpen: boolean;
  listName: string;
  listDescription: string;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onClose: () => void;
  onSave: () => void;
  isLoading?: boolean;
  isEditMode?: boolean;
}

interface DeleteListModalProps {
  isOpen: boolean;
  listName: string;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export const EditListModal: React.FC<EditListModalProps> = ({
  isOpen,
  listName,
  listDescription,
  onNameChange,
  onDescriptionChange,
  onClose,
  onSave,
  isLoading = false,
  isEditMode = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className={modalStyles.backdrop}>
      <div className={modalStyles.modal}>
        <div className={modalStyles.header}>
          <h5 className={modalStyles.title}>
            {isEditMode ? "Edit List" : "Create New List"}
          </h5>
          <button
            className={modalStyles.closeBtn}
            onClick={onClose}
            disabled={isLoading}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        <div className={modalStyles.body}>
          <div className={modalStyles.formGroup}>
            <label className={modalStyles.label}>
              Name <span className={modalStyles.required}>*</span>
            </label>
            <input
              className={modalStyles.input}
              value={listName}
              onChange={(e) => onNameChange(e.target.value)}
              disabled={isLoading}
              placeholder="Enter list name"
            />
          </div>
          <div className={modalStyles.formGroup}>
            <label className={modalStyles.label}>Description</label>
            <textarea
              className={modalStyles.textarea}
              rows={3}
              value={listDescription}
              onChange={(e) => onDescriptionChange(e.target.value)}
              disabled={isLoading}
              placeholder="Enter description (optional)"
            />
          </div>
        </div>
        <div className={modalStyles.footer}>
          <button
            className={modalStyles.cancelBtn}
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            className={modalStyles.saveBtn}
            onClick={onSave}
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : isEditMode ? "Update List" : "Save List"}
          </button>
        </div>
      </div>
    </div>
  );
};

export const DeleteListModal: React.FC<DeleteListModalProps> = ({
  isOpen,
  listName,
  onClose,
  onConfirm,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className={modalStyles.backdrop}>
      <div className={modalStyles.modal}>
        <div className={modalStyles.header}>
          <h5 className={modalStyles.title}>Delete List</h5>
          <button
            className={modalStyles.closeBtn}
            onClick={onClose}
            disabled={isLoading}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        <div className={modalStyles.body}>
          <p className={modalStyles.confirmText}>
            Are you sure you want to delete <strong>{listName}</strong>? This
            action cannot be undone.
          </p>
        </div>
        <div className={modalStyles.footer}>
          <button
            className={modalStyles.cancelBtn}
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            className={modalStyles.deleteBtn}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : "Delete List"}
          </button>
        </div>
      </div>
    </div>
  );
};