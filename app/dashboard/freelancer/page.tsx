"use client";

import { useEffect, useState } from "react";
import Sidebar from "../../../components/dashboard/Sidebar";
import { useTheme } from "../../../lib/useTheme";
import { 
  Briefcase, 
  Sparkles, 
  TrendingUp, 
  CheckCircle2, 
  Wallet, 
  Clock, 
  Star,
  Search,
  Filter,
  ArrowRight,
  Bot,
  Zap
} from "lucide-react";

export default function FreelancerDashboardPage() {
    const { colors } = useTheme();

    const StatCard = ({ icon: Icon, label, value, color }: any) => (
        <div style={{ background: "#111827", padding: "1.25rem", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ width: "32px", height: "32px", background: `${color}11`, borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "0.75rem" }}>
                <Icon size={16} color={color} />
            </div>
            <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "white", marginBottom: "0.25rem" }}>{value}</div>
            <div style={{ fontSize: "0.75rem", color: "#6B7280", fontWeight: 500 }}>{label}</div>
        </div>
    );

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "#030712" }}>
            <Sidebar />
            <main style={{ flex: 1, padding: "2.5rem", maxWidth: "1200px", margin: "0 auto" }}>
                <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "3rem" }}>
                    <div>
                        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "white", marginBottom: "0.5rem" }}>Work Explorer</h1>
                        <p style={{ color: "#4B5563", fontSize: "0.9rem" }}>AI has matched 12 new projects to your profile today.</p>
                    </div>
                    <div style={{ display: "flex", gap: "0.75rem" }}>
                         <div style={{ position: "relative" }}>
                            <Search size={16} color="#4B5563" style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)" }} />
                            <input 
                                type="text" 
                                placeholder="Search projects..." 
                                style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "10px", padding: "0.75rem 1rem 0.75rem 2.75rem", color: "white", fontSize: "0.85rem", width: "240px", outline: "none" }}
                            />
                         </div>
                         <button style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "10px", padding: "0.75rem", color: "white", cursor: "pointer" }}>
                            <Filter size={18} />
                         </button>
                    </div>
                </header>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.25rem", marginBottom: "3rem" }}>
                    <StatCard icon={Briefcase} label="Matched Projects" value="12" color="#3B82F6" />
                    <StatCard icon={Sparkles} label="AI Proposal Score" value="98%" color="#8B5CF6" />
                    <StatCard icon={TrendingUp} label="Profile Strength" value="Top 5%" color="#10B981" />
                    <StatCard icon={Wallet} label="Earnings" value="$2,450" color="#F59E0B" />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2.5rem" }}>
                    <section>
                         <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "white", marginBottom: "1.5rem" }}>Recommended for You</h2>
                         <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            {[
                                { title: "AI SaaS Platform", budget: "$5,000", match: 99, type: "Web Dev", time: "2h ago" },
                                { title: "Fintech Mobile App", budget: "$8,500", match: 94, type: "Mobile", time: "5h ago" },
                                { title: "Crypto Dashboard", budget: "$3,200", match: 88, type: "Design", time: "1d ago" }
                            ].map((p, i) => (
                                <div key={i} style={{ background: "#111827", padding: "1.5rem", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)", position: "relative", overflow: "hidden" }}>
                                    <div style={{ position: "absolute", top: 0, right: 0, background: p.match >= 95 ? "#3B82F6" : "rgba(255,255,255,0.05)", color: "white", fontSize: "0.7rem", fontWeight: 800, padding: "0.4rem 0.8rem", borderBottomLeftRadius: "12px" }}>
                                        {p.match}% MATCH
                                    </div>
                                    <div style={{ marginBottom: "1rem" }}>
                                        <div style={{ color: "#3B82F6", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.05em", marginBottom: "0.5rem", textTransform: "uppercase" }}>{p.type}</div>
                                        <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "white", marginBottom: "0.5rem" }}>{p.title}</h3>
                                        <p style={{ fontSize: "0.85rem", color: "#6B7280", lineHeight: 1.5 }}>Building a high-performance {p.title} with modern tech stack. Requires experience in AI integration...</p>
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "1rem", borderTop: "1px solid rgba(255,255,255,0.03)" }}>
                                        <div style={{ display: "flex", gap: "1.5rem", fontSize: "0.8rem", color: "#4B5563" }}>
                                            <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}><Wallet size={14} /> {p.budget}</span>
                                            <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}><Clock size={14} /> {p.time}</span>
                                        </div>
                                        <button style={{ background: "#3B82F6", color: "white", border: "none", borderRadius: "8px", padding: "0.5rem 1rem", fontSize: "0.8rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.4rem", cursor: "pointer" }}>
                                            <Sparkles size={14} /> Apply with AI
                                        </button>
                                    </div>
                                </div>
                            ))}
                         </div>
                    </section>

                    <aside>
                         <div style={{ background: "linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)", padding: "1.5rem", borderRadius: "16px", marginBottom: "2rem", color: "white" }}>
                            <Bot size={24} style={{ marginBottom: "1rem" }} />
                            <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.5rem" }}>AI Proposal Lab</h3>
                            <p style={{ fontSize: "0.8rem", opacity: 0.8, lineHeight: 1.5, marginBottom: "1.25rem" }}>Let Adeel AI analyze your profile and the project requirements to draft the perfect proposal.</p>
                            <button style={{ width: "100%", background: "white", color: "#3B82F6", border: "none", borderRadius: "10px", padding: "0.75rem", fontSize: "0.85rem", fontWeight: 700, cursor: "pointer" }}>Try Now</button>
                         </div>

                         <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "white", marginBottom: "1.5rem" }}>Career Growth</h2>
                         <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                             {[
                                { title: "Complete Profile", progress: 90, icon: Star, color: "#F59E0B" },
                                { title: "Skill Verification", progress: 45, icon: CheckCircle2, color: "#10B981" }
                             ].map((c, i) => (
                                <div key={i}>
                                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "0.5rem" }}>
                                        <span style={{ color: "#D1D5DB", fontWeight: 500 }}>{c.title}</span>
                                        <span style={{ color: "white", fontWeight: 700 }}>{c.progress}%</span>
                                    </div>
                                    <div style={{ width: "100%", height: "4px", background: "rgba(255,255,255,0.05)", borderRadius: "2px", overflow: "hidden" }}>
                                        <div style={{ width: `${c.progress}%`, height: "100%", background: c.color }} />
                                    </div>
                                </div>
                             ))}
                         </div>
                    </aside>
                </div>
            </main>
        </div>
    );
}
