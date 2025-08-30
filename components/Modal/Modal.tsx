"use client";

import { useEffect } from "react";

type ModalProps = React.PropsWithChildren<{
  open?: boolean;
  onClose?: () => void;
}>;

export default function Modal({ open = true, onClose, children }: ModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!open) return null;

  const close = () => onClose?.();

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={close}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "grid",
        placeItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(720px, 90vw)",
          background: "#131316",
          border: "1px solid #2a2a2f",
          borderRadius: 12,
          boxShadow: "0 10px 40px rgba(0,0,0,0.6)",
          padding: 24,
          color: "#fff",
          position: "relative",
        }}
      >
        <button
          onClick={close}
          aria-label="Close"
          style={{
            position: "absolute",
            top: 8,
            right: 12,
            fontSize: 24,
            lineHeight: 1,
            background: "transparent",
            border: "none",
            color: "#aaa",
            cursor: "pointer",
          }}
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
}
