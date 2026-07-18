"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "../lib/useAuth";
import { useTheme } from "../lib/useTheme";
import { 
  Bot, 
  Zap, 
  ShieldCheck, 
  ArrowRight, 
  Play, 
  Star, 
  CheckCircle2, 
  Sparkles,
  Layers,
  Layout,
  Code2,
  Cpu
} from "lucide-react";

export default function LandingPage() {
  const { user, profile, loading } = useAuth();
  const { colors } = useTheme();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!loading && user && profile) {
      if (profile.onboardingCompleted) {
        router.replace(`/dashboard/${profile.role}`);
      } else {
        router.replace("/onboarding");
      }
    }
  }, [user, profile, loading, router]);

  if (loading) {
    return (
      <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0B0C10" }}>
        <div style={{ width: "40px", height: "40px", border: "3px solid #1F2937", borderTopColor: "#3B82F6", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        <style jsx>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </main>
    );
  }

  const Nav = () => (
    <nav style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      height: "72px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 5%",
      background: scrolled ? "rgba(11, 12, 16, 0.8)" : "transparent",
      backdropFilter: scrolled ? "blur(12px)" : "none",
      borderBottom: scrolled ? "1px solid rgba(255,255,255,0.05)" : "none",
      zIndex: 1000,
      transition: "all 0.3s ease"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "2.5rem" }}>
        <Image src="/logo.png" alt="Arush" width={110} height={28} style={{ objectFit: "contain" }} />
        <div style={{ display: "flex", gap: "1.5rem", fontSize: "0.9rem", color: "#9CA3AF" }}>
          <a href="#features" style={{ textDecoration: "none", color: "inherit" }}>Features</a>
          <a href="#pricing" style={{ textDecoration: "none", color: "inherit" }}>Pricing</a>
          <a href="#faq" style={{ textDecoration: "none", color: "inherit" }}>FAQ</a>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <button onClick={() => router.push("/login")} style={{ background: "none", border: "none", color: "white", fontSize: "0.9rem", fontWeight: 500, cursor: "pointer" }}>Login</button>
        <button 
          onClick={() => router.push("/signup")}
          style={{ 
            background: "#3B82F6", 
            color: "white", 
            padding: "0.6rem 1.2rem", 
            borderRadius: "8px", 
            border: "none", 
            fontSize: "0.9rem", 
            fontWeight: 600, 
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}
        >
          Get Started <ArrowRight size={16} />
        </button>
      </div>
    </nav>
  );

  const Hero = () => (
    <section style={{ 
      padding: "180px 5% 100px", 
      textAlign: "center", 
      position: "relative",
      background: "radial-gradient(circle at 50% -20%, #1D4ED811 0%, transparent 50%)"
    }}>
      <div style={{ 
        display: "inline-flex", 
        alignItems: "center", 
        gap: "0.5rem", 
        background: "rgba(59, 130, 246, 0.1)", 
        padding: "0.5rem 1rem", 
        borderRadius: "999px", 
        color: "#60A5FA", 
        fontSize: "0.85rem", 
        fontWeight: 600,
        marginBottom: "2rem",
        border: "1px solid rgba(59, 130, 246, 0.2)"
      }}>
        <Sparkles size={14} /> The Future of Product Development
      </div>
      <h1 style={{ 
        fontSize: "clamp(2.5rem, 6vw, 4.5rem)", 
        fontWeight: 800, 
        color: "white", 
        lineHeight: 1.1, 
        maxWidth: "900px", 
        margin: "0 auto 1.5rem",
        letterSpacing: "-0.02em"
      }}>
        Build Products Faster with <span style={{ color: "#3B82F6" }}>AI Intelligence.</span>
      </h1>
      <p style={{ 
        fontSize: "clamp(1.1rem, 1.5vw, 1.25rem)", 
        color: "#9CA3AF", 
        maxWidth: "600px", 
        margin: "0 auto 3rem",
        lineHeight: 1.6
      }}>
        Arush Marketplace isn't just a freelancer platform. It's an AI-native ecosystem that guides your project from idea to launch.
      </p>
      <div style={{ display: "flex", justifyContent: "center", gap: "1rem" }}>
        <button 
          onClick={() => router.push("/signup")}
          style={{ 
            background: "#3B82F6", 
            color: "white", 
            padding: "1rem 2rem", 
            borderRadius: "12px", 
            border: "none", 
            fontSize: "1.1rem", 
            fontWeight: 700, 
            cursor: "pointer",
            boxShadow: "0 20px 40px -10px rgba(59, 130, 246, 0.4)"
          }}
        >
          🚀 Get Started
        </button>
        <button 
          style={{ 
            background: "rgba(255,255,255,0.05)", 
            color: "white", 
            padding: "1rem 2rem", 
            borderRadius: "12px", 
            border: "1px solid rgba(255,255,255,0.1)", 
            fontSize: "1.1rem", 
            fontWeight: 600, 
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem"
          }}
        >
          <Play size={18} fill="white" /> Watch Demo
        </button>
      </div>

      <div style={{ marginTop: "5rem", position: "relative" }}>
         <div style={{ 
           width: "100%", 
           maxWidth: "1100px", 
           margin: "0 auto", 
           background: "#111827", 
           borderRadius: "24px", 
           padding: "1rem", 
           border: "1px solid rgba(255,255,255,0.1)",
           boxShadow: "0 40px 100px -20px rgba(0,0,0,0.5)"
         }}>
            <div style={{ 
              width: "100%", 
              aspectRatio: "16/9", 
              background: "#030712", 
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#374151"
            }}>
               <Image src="/logo.png" alt="Product Preview" width={200} height={50} style={{ opacity: 0.2 }} />
            </div>
         </div>
         <div style={{ position: "absolute", top: "-10%", left: "5%", width: "200px", height: "200px", background: "#3B82F622", filter: "blur(60px)", zIndex: -1 }} />
         <div style={{ position: "absolute", bottom: "-10%", right: "5%", width: "200px", height: "200px", background: "#60A5FA11", filter: "blur(60px)", zIndex: -1 }} />
      </div>
    </section>
  );

  const Features = () => (
    <section id="features" style={{ padding: "100px 5%" }}>
      <div style={{ textAlign: "center", marginBottom: "5rem" }}>
        <h2 style={{ fontSize: "2.5rem", fontWeight: 800, color: "white", marginBottom: "1rem" }}>
          AI-Driven Workflow
        </h2>
        <p style={{ color: "#9CA3AF", maxWidth: "600px", margin: "0 auto" }}>
          Forget manual project scoping. Our AI agents handle the heavy lifting so you can focus on building.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem" }}>
        {[
          { icon: Bot, title: "AI Project Brief", desc: "Instantly generate detailed PRDs, tech stacks, and milestones from a simple prompt." },
          { icon: Layout, title: "Product Preview", desc: "Visualize your app's UI, wireframes, and UX flow before you even hire a developer." },
          { icon: Cpu, title: "Smart Matching", desc: "Our AI matches your project with the perfect talent based on skill-embeddings." },
          { icon: ShieldCheck, title: "Risk Analysis", desc: "Identify potential bottlenecks and security risks early in the planning phase." },
          { icon: Zap, title: "Rapid Iteration", desc: "Regenerate UI components and project plans in seconds as your vision evolves." },
          { icon: Layers, title: "Full Stack Ready", desc: "From landing pages to complex SaaS architectures, Arush handles it all." }
        ].map((f, i) => (
          <div key={i} style={{ 
            background: "#111827", 
            padding: "2.5rem", 
            borderRadius: "20px", 
            border: "1px solid rgba(255,255,255,0.05)",
            transition: "transform 0.3s ease",
            cursor: "default"
          }}>
            <div style={{ width: "48px", height: "48px", background: "#3B82F611", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.5rem" }}>
              <f.icon color="#3B82F6" size={24} />
            </div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "white", marginBottom: "0.75rem" }}>{f.title}</h3>
            <p style={{ color: "#9CA3AF", lineHeight: 1.6, fontSize: "0.95rem" }}>{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );

  const Pricing = () => (
    <section id="pricing" style={{ padding: "100px 5%", background: "rgba(17, 24, 39, 0.4)" }}>
       <div style={{ textAlign: "center", marginBottom: "5rem" }}>
        <h2 style={{ fontSize: "2.5rem", fontWeight: 800, color: "white", marginBottom: "1rem" }}>
          Simple, Transparent Pricing
        </h2>
        <p style={{ color: "#9CA3AF", maxWidth: "600px", margin: "0 auto" }}>
          Choose the plan that fits your growth.
        </p>
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: "2rem", flexWrap: "wrap" }}>
        {[
          { name: "Free", price: "$0", features: ["2 AI Project Briefs", "Basic UI Preview", "Standard Matching", "Community Support"] },
          { name: "Pro", price: "$29", features: ["Unlimited Briefs", "Advanced UI Previews", "Priority AI Matching", "PRD Generation", "Milestone Tracking"], popular: true },
          { name: "Enterprise", price: "Custom", features: ["Dedicated AI Agent", "Custom Tech Stacks", "Team Collaboration", "API Access", "White-label Options"] }
        ].map((p, i) => (
          <div key={i} style={{ 
            background: p.popular ? "#1F2937" : "#111827", 
            padding: "3rem", 
            borderRadius: "24px", 
            width: "100%", 
            maxWidth: "360px", 
            border: p.popular ? "2px solid #3B82F6" : "1px solid rgba(255,255,255,0.05)",
            position: "relative"
          }}>
            {p.popular && <div style={{ position: "absolute", top: "1rem", right: "1rem", background: "#3B82F6", color: "white", padding: "0.3rem 0.8rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 700 }}>MOST POPULAR</div>}
            <h3 style={{ fontSize: "1.1rem", color: "#9CA3AF", marginBottom: "0.5rem" }}>{p.name}</h3>
            <div style={{ fontSize: "2.5rem", fontWeight: 800, color: "white", marginBottom: "2rem" }}>{p.price}<span style={{ fontSize: "1rem", fontWeight: 400, color: "#6B7280" }}>{p.price !== "Custom" && "/mo"}</span></div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2.5rem" }}>
              {p.features.map((f, fi) => (
                <div key={fi} style={{ display: "flex", alignItems: "center", gap: "0.75rem", color: "#D1D5DB", fontSize: "0.95rem" }}>
                  <CheckCircle2 size={16} color="#3B82F6" /> {f}
                </div>
              ))}
            </div>
            <button style={{ 
              width: "100%", 
              padding: "0.9rem", 
              borderRadius: "12px", 
              border: "none", 
              background: p.popular ? "#3B82F6" : "rgba(255,255,255,0.05)", 
              color: "white", 
              fontWeight: 700, 
              cursor: "pointer" 
            }}>
              Get Started
            </button>
          </div>
        ))}
      </div>
    </section>
  );

  return (
    <main style={{ minHeight: "100vh", background: "#0B0C10", overflowX: "hidden" }}>
      <Nav />
      <Hero />
      <Features />
      <Pricing />
      
      <footer style={{ padding: "100px 5% 50px", borderTop: "1px solid rgba(255,255,255,0.05)", textAlign: "center" }}>
        <Image src="/logo.png" alt="Arush" width={90} height={24} style={{ opacity: 0.5, marginBottom: "2rem" }} />
        <div style={{ display: "flex", justifyContent: "center", gap: "2rem", color: "#6B7280", fontSize: "0.9rem", marginBottom: "3rem" }}>
          <a href="/terms" style={{ textDecoration: "none", color: "inherit" }}>Terms</a>
          <a href="/privacy" style={{ textDecoration: "none", color: "inherit" }}>Privacy</a>
          <a href="mailto:hello@arush.ai" style={{ textDecoration: "none", color: "inherit" }}>Contact</a>
        </div>
        <p style={{ color: "#374151", fontSize: "0.85rem" }}>© 2026 Arush Labs. Built with ❤️ for the future of building.</p>
      </footer>
    </main>
  );
}
