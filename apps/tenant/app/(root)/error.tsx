"use client";

import { useEffect } from "react";

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Root layout error boundary — catches unexpected errors in the (root) segment,
 * including DB connection failures during tenant membership resolution.
 * Prevents the default Next.js 500 page from surfacing raw error details.
 */
export default function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    // Log to your error reporting service here (e.g. Sentry)
    console.error("[Root Layout Error]", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto">
          <span className="text-3xl">⚠️</span>
        </div>
        <h1 className="text-2xl font-bold text-foreground">কিছু একটা ভুল হয়েছে</h1>
        <p className="text-muted-foreground">
          পোর্টালটি লোড করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।
        </p>
        {process.env.NODE_ENV !== "production" && (
          <p className="text-xs text-muted-foreground bg-muted rounded-lg p-3 text-left font-mono break-all">
            {error.message}
          </p>
        )}
        <div className="flex gap-3 justify-center pt-2">
          <button
            onClick={reset}
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            আবার চেষ্টা করুন
          </button>
          <a
            href="/auth/sign-in"
            className="px-4 py-2 rounded-md bg-muted text-foreground text-sm font-medium hover:bg-muted/80 transition-colors"
          >
            লগইন পেজে যান
          </a>
        </div>
      </div>
    </div>
  );
}
