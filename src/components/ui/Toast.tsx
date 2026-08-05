"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type Toast = {
  id: number;
  message: string;
  type: "success" | "error" | "info";
};

type ToastContextType = {
  toasts: Toast[];
  addToast: (message: string, type?: Toast["type"]) => void;
  removeToast: (id: number) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: Toast["type"] = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 4000);
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: number) => void }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`px-4 py-3 rounded-lg shadow-lg text-white min-w-[250px] max-w-md animate-slide-in ${
            t.type === "success"
              ? "bg-success"
              : t.type === "error"
              ? "bg-danger"
              : "bg-accent"
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm">{t.message}</p>
            <button
              onClick={() => onRemove(t.id)}
              className="text-white/70 hover:text-white text-lg leading-none"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}