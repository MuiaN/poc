"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui";
import { api } from "@/lib/api";

export function AcceptInvitation() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
      setStatus("error");
      setMessage("No invitation token provided.");
      return;
    }

    const handleAccept = async () => {
      try {
        const response = await api.auth.acceptInvitation(token);
        setStatus("success");
        setMessage(response.message || "Account activated successfully. An email with your login credentials and temporary password will arrive shortly. Please log in and change your password immediately.");
      } catch (err) {
        setStatus("error");
        setMessage(err instanceof Error ? err.message : "Failed to activate account.");
      }
    };

    handleAccept();
  }, []);

  if (status === "loading") {
    return (
      <Card className="max-w-md mx-auto mt-20 p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-accent border-t-transparent mx-auto mb-4" />
        <p className="text-text-2">Activating your account...</p>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto mt-20 p-8 text-center">
      <div className={`mx-auto mb-4 w-12 h-12 rounded-full flex items-center justify-center ${
        status === "success" ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
      }`}>
        {status === "success" ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
      </div>
      <h2 className="text-lg font-semibold text-text mb-2">
        {status === "success" ? "Account Activated" : "Activation Failed"}
      </h2>
      <p className="text-text-2 mb-6">{message}</p>
      <a
        href="/login"
        className="inline-block px-4 py-2 bg-accent text-white rounded-md hover:bg-accent-h transition-colors"
      >
        Go to Login
      </a>
    </Card>
  );
}