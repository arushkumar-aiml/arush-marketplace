"use client";

import Sidebar from "../../../components/dashboard/Sidebar";
import { 
  Plus, 
  Bot, 
  Layout, 
  FileText, 
  Sparkles, 
  Zap,
  Clock,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

function ActionCard({
    icon: Icon,
    title,
    desc,
    color,
    onClick,
}: {
    icon: LucideIcon;
    title: string;
    desc: string;
    color: string;
    onClick?: () => void;
}) {
    return (
        <div
            onClick={onClick}
            style={{
                background: "#111827",
                padding: "1.5rem",
                borderRadius: "16px",
                border: "1px solid rgba(255,255,255,0.05)",
                cursor: onClick ? "pointer" : "default",
                transition: "all 0.2s ease",
            }}
        >
            <div style={{ width: "40px", height: "40px", background: `${color}11`, borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.25rem" }}>
                <Icon size={20} color={color} />
            </div>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "white", marginBottom: "0.5rem" }}>{title}</h3>
            <p style={{ fontSize: "0.8rem", color: "#6B7280", lineHeight: 1.5 }}>{desc}</p>
        </div>
    );
}

export default function ClientDashboardPage() {
    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "#030712" }}>
            <Sidebar />
            <main style={{ flex: 1, padding: "2.5rem", maxWidth: "1200px", margin: "0 auto" }}>
                <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "3rem" }}>
                    <div>
                        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "white", marginBottom: "0.5rem" }}>Product Workspace</h1>
                        <p style={{ color: "#4B5563", fontSize: "0.9rem" }}>Welcome back. What are we building today?</p>
                    </div>
                    <button style={{ 
                        background: "#3B82F6", 
                        color: "white", 
                        padding: "0.75rem 1.25rem", 
                        borderRadius: "10px", 
                        border: "none", 
                        fontSize: "0.9rem", 
                        fontWeight: 600, 
                        display: "flex", 
                        alignItems: "center", 
                        gap: "0.5rem",
                        cursor: "pointer"
                    }}>
                        <Plus size={18} /> New Product
                    </button>
                </header>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.25rem", marginBottom: "3rem" }}>
                    <ActionCard icon={Bot} title="AI Planning Agent" desc="Generate PRD, milestones and tech stack." color="#3B82F6" />
                    <ActionCard icon={Layout} title="Product Preview" desc="Visualize UI/UX before development." color="#8B5CF6" />
                    <ActionCard icon={Zap} title="Rapid Prototype" desc="Generate functional boilerplate code." color="#F59E0B" />
                    <ActionCard icon={Sparkles} title="Risk Analyzer" desc="Detect bottlenecks and tech debt early." color="#10B981" />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2.5rem" }}>
                    <section>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "white" }}>Active Products</h2>
                            <button style={{ background: "none", border: "none", color: "#3B82F6", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer" }}>View All</button>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                             {[
                                { title: "Nexus E-commerce", status: "Planning", progress: 20, lastUpdate: "2h ago" },
                                { title: "Pulse Analytics", status: "Development", progress: 65, lastUpdate: "5h ago" }
                             ].map((p, i) => (
                                <div key={i} style={{ background: "#111827", padding: "1.25rem", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                        <div style={{ width: "40px", height: "40px", background: "rgba(255,255,255,0.03)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                            <FileText size={18} color="#9CA3AF" />
                                        </div>
                                        <div>
                                            <h4 style={{ color: "white", fontWeight: 600, fontSize: "0.9rem", marginBottom: "0.25rem" }}>{p.title}</h4>
                                            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.7rem", color: "#4B5563" }}>
                                                <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}><Clock size={12} /> {p.lastUpdate}</span>
                                                <span style={{ color: "#3B82F6", fontWeight: 700 }}>{p.status}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: "right" }}>
                                        <div style={{ fontSize: "0.8rem", color: "white", fontWeight: 700, marginBottom: "0.25rem" }}>{p.progress}%</div>
                                        <div style={{ width: "100px", height: "4px", background: "rgba(255,255,255,0.05)", borderRadius: "2px", overflow: "hidden" }}>
                                            <div style={{ width: `${p.progress}%`, height: "100%", background: "#3B82F6" }} />
                                        </div>
                                    </div>
                                </div>
                             ))}
                        </div>
                    </section>

                    <section>
                         <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "white", marginBottom: "1.5rem" }}>Recent Notifications</h2>
                         <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            {[
                                { text: "AI finished UI Preview for Nexus", time: "10m ago", icon: Sparkles, color: "#8B5CF6" },
                                { text: "New application for Pulse Analytics", time: "1h ago", icon: Users, color: "#3B82F6" }
                            ].map((n, i) => (
                                <div key={i} style={{ display: "flex", gap: "1rem" }}>
                                    <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: `${n.color}11`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                        <n.icon size={16} color={n.color} />
                                    </div>
                                    <div>
                                        <p style={{ fontSize: "0.8rem", color: "#D1D5DB", lineHeight: 1.4, marginBottom: "0.25rem" }}>{n.text}</p>
                                        <span style={{ fontSize: "0.7rem", color: "#4B5563" }}>{n.time}</span>
                                    </div>
                                </div>
                            ))}
                         </div>
                    </section>
                </div>
            </main>
        </div>
    );
}
