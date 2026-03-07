"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type ToastVariant = "success" | "error" | "info";

interface ToastAction {
  label: string;
  onClick: () => void | Promise<void>;
}

interface ToastOptions {
  message: string;
  variant?: ToastVariant;
  duration?: number;
  action?: ToastAction;
}

interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
  action?: ToastAction;
}

interface ToastContextValue {
  toast: (message: string | ToastOptions, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}

const variantStyles: Record<ToastVariant, string> = {
  success: "bg-green-50/95 text-green-700 border-green-200/80",
  error: "bg-orange-50/95 text-orange-700 border-orange-200/80",
  info: "bg-blue-50/95 text-blue-700 border-blue-200/80",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timeoutRefs = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: string) => {
    const timeout = timeoutRefs.current.get(id);

    if (timeout) {
      clearTimeout(timeout);
      timeoutRefs.current.delete(id);
    }

    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    const timeouts = timeoutRefs.current;

    return () => {
      timeouts.forEach((timeout) => clearTimeout(timeout));
      timeouts.clear();
    };
  }, []);

  const toast = useCallback(
    (messageOrOptions: string | ToastOptions, variant: ToastVariant = "info") => {
      const options =
        typeof messageOrOptions === "string"
          ? { message: messageOrOptions, variant }
          : messageOrOptions;

      const id = crypto.randomUUID();
      const nextToast: Toast = {
        id,
        message: options.message,
        variant: options.variant ?? "info",
        action: options.action,
      };

      setToasts((prev) => [...prev, nextToast]);

      const timeout = setTimeout(() => {
        dismiss(id);
      }, options.duration ?? 4000);

      timeoutRefs.current.set(id, timeout);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed inset-x-4 bottom-4 z-50 flex flex-col gap-2 sm:inset-x-auto sm:right-4 sm:w-[24rem]">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "fade-in-up flex items-center gap-3 rounded-[20px] border px-4 py-3 shadow-floating backdrop-blur-xl",
              "font-heading text-sm font-medium",
              variantStyles[t.variant]
            )}
          >
            <span className="flex-1">{t.message}</span>
            {t.action && (
              <button
                onClick={() => {
                  void Promise.resolve(t.action?.onClick()).finally(() => {
                    dismiss(t.id);
                  });
                }}
                className="rounded-full border border-current/20 px-3 py-1 text-xs font-semibold transition-colors hover:bg-black/5 cursor-pointer"
              >
                {t.action.label}
              </button>
            )}
            <button
              onClick={() => dismiss(t.id)}
              className="rounded-full p-1 transition-colors hover:bg-black/5 cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
