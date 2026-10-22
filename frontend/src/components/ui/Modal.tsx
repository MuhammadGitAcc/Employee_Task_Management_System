import React, { useEffect, useId, useRef } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="w-[calc(100%-2rem)] max-w-lg rounded-lg p-0 shadow-xl backdrop:bg-black/50 dark:bg-gray-800 dark:text-gray-100"
    >
      <div className="p-6">
        <div className="flex items-start justify-between">
          <h2
            id={titleId}
            className="text-lg font-semibold text-gray-800 dark:text-gray-100"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded px-1 text-2xl leading-none text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-gray-400 dark:hover:text-gray-200"
          >
            &times;
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </dialog>
  );
};

export default Modal;
