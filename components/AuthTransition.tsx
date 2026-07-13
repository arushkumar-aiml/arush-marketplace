"use client";

import Image from "next/image";

export default function AuthTransition({ message }: { message: string }) {
    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                background: "#0B0C10",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 9999,
            }}
        >
            <style>{`
        @keyframes pulseGlow {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.08); opacity: 0.85; }
        }
        @keyframes orbit {
          from { transform: rotate(0deg) translateX(38px) rotate(0deg); }
          to { transform: rotate(360deg) translateX(38px) rotate(-360deg); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .auth-dot {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin-top: -4px;
          margin-left: -4px;
          animation: orbit 2.4s linear infinite;
        }
      `}</style>

            <div style={{ position: "relative", width: "96px", height: "96px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div className="auth-dot" style={{ background: "#4C6FFF", animationDelay: "0s" }} />
                <div className="auth-dot" style={{ background: "#C9A227", animationDelay: "-0.8s" }} />
                <div className="auth-dot" style={{ background: "#4C6FFF", animationDelay: "-1.6s", opacity: 0.6 }} />

                <div style={{ animation: "pulseGlow 1.6s ease-in-out infinite" }}>
                    <Image src="/logo.png" alt="Arush Labs" width={56} height={56} style={{ objectFit: "contain" }} />
                </div>
            </div>

            <p
                style={{
                    color: "#9A9CA5",
                    fontSize: "0.9rem",
                    marginTop: "2rem",
                    animation: "fadeInUp 0.5s ease-out",
                }}
            >
                {message}
            </p>
        </div>
    );
}