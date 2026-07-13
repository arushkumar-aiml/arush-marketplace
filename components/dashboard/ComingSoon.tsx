"use client";

import Sidebar from "./Sidebar";
import DashboardHeader from "./DashboardHeader";
import { Construction } from "lucide-react";

export default function ComingSoon({ pageName }: { pageName: string }) {
    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "white" }}>
            <Sidebar />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
                <DashboardHeader subtitle={`${pageName} is on its way.`} />
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ textAlign: "center", maxWidth: "400px" }}>
                        <div
                            style={{
                                width: "64px",
                                height: "64px",
                                borderRadius: "16px",
                                background: "#EFF3FF",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                margin: "0 auto 1.5rem",
                            }}
                        >
                            <Construction size={28} color="#2563EB" />
                        </div>
                        <h2 style={{ fontSize: "1.2rem", fontWeight: 600, color: "#12131A", marginBottom: "0.5rem" }}>
                            {pageName} — Coming Soon
                        </h2>
                        <p style={{ color: "#7A7C87", fontSize: "0.9rem" }}>
                            We&apos;re building this next. Check back soon!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}