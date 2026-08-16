"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to error reporting service (e.g., Sentry)
    console.error("[Global Error]", error.digest, error);
  }, [error]);

  // Inline styles as fallback if Tailwind fails to load
  const containerStyle: React.CSSProperties = {
    display: "flex",
    minHeight: "100vh",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  };

  const headingStyle: React.CSSProperties = {
    fontSize: "1.5rem",
    fontWeight: "bold",
    marginBottom: "1rem",
  };

  const textStyle: React.CSSProperties = {
    color: "#666",
    marginBottom: "1rem",
  };

  const digestStyle: React.CSSProperties = {
    fontSize: "0.75rem",
    color: "#999",
    fontFamily: "monospace",
    marginBottom: "1rem",
  };

  const buttonStyle: React.CSSProperties = {
    padding: "0.5rem 1rem",
    backgroundColor: "#0070f3",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: "1rem",
  };

  return (
    <html lang="en">
      <body style={containerStyle}>
        <div style={{ textAlign: "center", maxWidth: 400 }}>
          <h1 style={headingStyle}>Something went wrong</h1>
          <p style={textStyle}>
            An unexpected error occurred. Please try again.
          </p>
          {error.digest && <p style={digestStyle}>Error ID: {error.digest}</p>}
          <button onClick={reset} style={buttonStyle}>
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
