"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

function Dialog({ open, onClose, children, className }: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleClose = () => onClose();
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, [onClose]);

  return (
    <dialog
      ref={dialogRef}
      className={cn(
        "backdrop:bg-dark/38 backdrop:backdrop-blur-[2px] sm:backdrop:backdrop-blur-md",
        "mx-auto my-auto w-[min(calc(100%-1.25rem),58rem)] max-h-[calc(100vh-1.25rem)] overflow-hidden rounded-[32px] border border-[rgba(228,210,191,0.7)] bg-[#fcfbf8] p-0 shadow-dialog",
        "fade-in-up",
        className
      )}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
    >
      {open && children}
    </dialog>
  );
}

function DialogHeader({
  children,
  onClose,
  className,
}: {
  children: ReactNode;
  onClose?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between px-5 pb-2 pt-5 sm:px-7 sm:pt-7",
        className
      )}
    >
      <h2 className="text-lg font-heading font-semibold text-dark">
        {children}
      </h2>
      {onClose && (
        <button
          onClick={onClose}
          className="rounded-full p-2 text-muted-foreground transition-colors duration-200 hover:bg-white hover:text-dark cursor-pointer"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
}

function DialogContent({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("max-h-[calc(100vh-13rem)] overflow-y-auto px-5 pb-6 sm:px-7 sm:pb-7", className)}>
      {children}
    </div>
  );
}

function DialogFooter({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-end gap-3 border-t border-border/70 bg-white/68 px-5 pb-5 pt-4 backdrop-blur-[2px] sm:px-7 sm:pb-7 sm:backdrop-blur-sm",
        className
      )}
    >
      {children}
    </div>
  );
}

export { Dialog, DialogHeader, DialogContent, DialogFooter };
