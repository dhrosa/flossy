import { ReactNode, useEffect, useState } from "react";

/** Hook for tracking modal open/close state.  */
export function useModalState() {
  const [modalIsOpen, setIsOpen] = useState(false);

  return {
    modalIsOpen,
    openModal: () => setIsOpen(true),
    closeModal: () => setIsOpen(false),
  };
}

export function Modal({
  children,
  isOpen,
  onClose,
}: {
  children?: ReactNode;
  isOpen: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    const onEscape = (event: any) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", onEscape);
    return () => {
      window.removeEventListener("keydown", onEscape);
    };
  });
  return (
    <div className={"modal " + (isOpen ? "is-active" : "")}>
      <div className="modal-background" onClick={onClose} />
      <div className="modal-content">{children}</div>
      <button
        className="modal-close is-large"
        aria-label="close"
        onClick={onClose}
      />
    </div>
  );
}
