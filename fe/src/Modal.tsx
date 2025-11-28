import { ReactNode, useEffect } from "react";

export function Modal({
  children,
  active,
  onClose,
}: {
  children?: ReactNode;
  active: boolean;
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
    <div className={"modal " + (active ? "is-active" : "")}>
      <div className="modal-background" onClick={onClose} />
      <div className="modal-content">{children}</div>
      <button className="modal-close is-large" aria-label="close" />
    </div>
  );
}
