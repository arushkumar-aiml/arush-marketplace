import Link from "next/link";

export default function NotFound() {
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
        <p style={{ color: "#60A5FA", fontWeight: 700, marginBottom: "0.75rem" }}>404</p>
        <h1 style={{ fontSize: "1.75rem", margin: "0 0 0.75rem" }}>Page not found</h1>
        <p style={{ color: "#B6B8C3", lineHeight: 1.6, margin: "0 0 1.5rem" }}>
          The page you requested does not exist or may have moved.
        </p>
        <Link
          href="/"
          style={{
            display: "inline-block",
            borderRadius: "10px",
            padding: "0.8rem 1.2rem",
            background: "#2563EB",
            color: "#FFFFFF",
            textDecoration: "none",
            fontWeight: 700,
          }}
        >
          Go home
        </Link>
      </section>
    </main>
  );
}
