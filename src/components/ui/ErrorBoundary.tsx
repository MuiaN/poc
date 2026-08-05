"use client";

import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="flex h-full items-center justify-center p-8 bg-bg">
          <div className="max-w-md text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-danger/10">
              <svg
                className="h-6 w-6 text-danger"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m-2 2l2 2"
                />
              </svg>
            </div>
            <h2 className="mb-2 text-lg font-semibold text-text">Something went wrong</h2>
            <p className="text-text-2">
              We&apos;re sorry, but something unexpected happened.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 inline-flex items-center justify-center rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-h focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}