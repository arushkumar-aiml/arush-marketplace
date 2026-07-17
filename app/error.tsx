"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "1.5rem",
        background: "#0F1016",
        color: "#FFFFFF",
      }}
    >
      <section style={{ maxWidth: "440px", textAlign: "center" }}>
        <p style={{ color: "#60A5FA", fontWeight: 700, marginBottom: "0.75rem" }}>Arush Marketplace</p>
        <h1 style={{ fontSize: "1.75rem", margin: "0 0 0.75rem" }}>Something went wrong</h1>
        <p style={{ color: "#B6B8C3", lineHeight: 1.6, margin: "0 0 1.5rem" }}>
          Please try again. If the problem continues, return to the dashboard and retry later.
        </p>
        <button
          type="button"
          onClick={reset}
          style={{
            border: 0,
            borderRadius: "10px",
            padding: "0.8rem 1.2rem",
            background: "#2563EB",
            color: "#FFFFFF",
            cursor: "pointer",
            fontWeight: 700,
          }}
        >
          Try again
        </button>
      </section>
    </main>
  );
}
