"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../lib/useAuth";
import { useTheme } from "../../lib/useTheme";
import { 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Briefcase, 
  User, 
  Rocket, 
  Laptop, 
  Smartphone, 
  Globe, 
  Layout, 
  Database, 
  Palette,
  ArrowLeft,
  Loader2
} from "lucide-react";
import type { UserRole, Occupation, FreelanceWorkType } from "../../types/user";

type Step = "welcome" | "role" | "client-details" | "freelancer-details" | "ai-processing" | "complete";

export default function OnboardingPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const { colors } = useTheme();
  const router = useRouter();

  const [step, setStep] = useState<Step>("welcome");
  const [role, setRole] = useState<UserRole>("client");
  const [loading, setLoading] = useState(false);

  // Client State
  const [productType, setProductType] = useState("");
  const [budget, setBudget] = useState("");
  const [timeline, setTimeline] = useState("");

  // Freelancer State
  const [skills, setSkills] = useState("");
  const [experience, setExperience] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
    if (!authLoading && profile?.onboardingCompleted) {
       router.replace(`/dashboard/${profile.role}`);
    }
  }, [user, profile, authLoading, router]);

  if (authLoading || !user) return null;

  const updateProfile = async (data: any) => {
    try {
      await updateDoc(doc(db, "users", user.uid), data);
    } catch (err) {
      console.error("Failed to update profile:", err);
    }
  };

  const nextStep = () => {
    if (step === "welcome") setStep("role");
    else if (step === "role") {
      if (role === "client") setStep("client-details");
      else setStep("freelancer-details");
    }
    else if (step === "client-details" || step === "freelancer-details") setStep("ai-processing");
  };

  const prevStep = () => {
    if (step === "role") setStep("welcome");
    else if (step === "client-details" || step === "freelancer-details") setStep("role");
  };

  const finishOnboarding = async () => {
    setLoading(true);
    // Simulate AI Processing
    await new Promise(r => setTimeout(r, 3000));
    
    await updateProfile({
      role,
      onboardingCompleted: true,
      ...(role === "client" ? { productType, budget, timeline } : { skills: skills.split(","), experience }),
      aiCredits: 20
    });
    
    setStep("complete");
    setLoading(false);
  };

  useEffect(() => {
    if (step === "ai-processing") {
      finishOnboarding();
    }
  }, [step]);

  const WelcomeStep = () => (
    <div style={{ textAlign: "center", maxWidth: "500px", margin: "0 auto" }}>
      <div style={{ width: "80px", height: "80px", background: "#3B82F622", borderRadius: "24px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 2rem" }}>
        <Sparkles size={40} color="#3B82F6" />
      </div>
      <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "white", marginBottom: "1rem" }}>Welcome to Arush</h1>
      <p style={{ color: "#9CA3AF", lineHeight: 1.6, marginBottom: "2.5rem" }}>
        We're excited to help you build or work on incredible products. Let's personalize your experience in just a few steps.
      </p>
      <button 
        onClick={nextStep}
        style={{ width: "100%", padding: "1rem", borderRadius: "12px", background: "#3B82F6", color: "white", fontWeight: 700, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
      >
        Continue <ArrowRight size={18} />
      </button>
    </div>
  );

  const RoleStep = () => (
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
      <h2 style={{ fontSize: "1.75rem", fontWeight: 800, color: "white", textAlign: "center", marginBottom: "2.5rem" }}>How will you use Arush?</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        {[
          { id: "client", title: "I want to build products", desc: "For founders, managers and dreamers looking to hire.", icon: Rocket },
          { id: "freelancer", title: "I want to work on projects", desc: "For developers, designers and experts looking to work.", icon: Briefcase }
        ].map(r => (
          <div 
            key={r.id} 
            onClick={() => setRole(r.id as UserRole)}
            style={{ 
              background: "#111827", 
              padding: "2rem", 
              borderRadius: "20px", 
              border: `2px solid ${role === r.id ? "#3B82F6" : "rgba(255,255,255,0.05)"}`,
              cursor: "pointer",
              transition: "all 0.2s ease",
              textAlign: "center"
            }}
          >
            <div style={{ width: "48px", height: "48px", background: role === r.id ? "#3B82F622" : "rgba(255,255,255,0.05)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
              <r.icon color={role === r.id ? "#3B82F6" : "#9CA3AF"} size={24} />
            </div>
            <h3 style={{ fontWeight: 700, color: "white", marginBottom: "0.5rem" }}>{r.title}</h3>
            <p style={{ fontSize: "0.85rem", color: "#6B7280" }}>{r.desc}</p>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: "1rem", marginTop: "3rem" }}>
        <button onClick={prevStep} style={{ flex: 1, padding: "1rem", borderRadius: "12px", background: "rgba(255,255,255,0.05)", color: "white", fontWeight: 600, border: "none", cursor: "pointer" }}>Back</button>
        <button onClick={nextStep} style={{ flex: 2, padding: "1rem", borderRadius: "12px", background: "#3B82F6", color: "white", fontWeight: 700, border: "none", cursor: "pointer" }}>Continue</button>
      </div>
    </div>
  );

  const ClientDetailsStep = () => (
    <div style={{ maxWidth: "500px", margin: "0 auto" }}>
       <h2 style={{ fontSize: "1.75rem", fontWeight: 800, color: "white", textAlign: "center", marginBottom: "2rem" }}>Project Vision</h2>
       <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div>
            <label style={{ display: "block", color: "#9CA3AF", fontSize: "0.85rem", marginBottom: "0.5rem" }}>What do you want to build?</label>
            <select 
              value={productType} 
              onChange={e => setProductType(e.target.value)}
              style={{ width: "100%", padding: "1rem", borderRadius: "12px", background: "#111827", color: "white", border: "1px solid rgba(255,255,255,0.1)", outline: "none" }}
            >
              <option value="">Select a category</option>
              <option value="SaaS">SaaS Platform</option>
              <option value="Mobile App">Mobile Application</option>
              <option value="E-commerce">E-commerce Store</option>
              <option value="AI Tool">AI / ML Tool</option>
              <option value="Website">Modern Website</option>
            </select>
          </div>
          <div>
            <label style={{ display: "block", color: "#9CA3AF", fontSize: "0.85rem", marginBottom: "0.5rem" }}>Budget Range (USD)</label>
            <input 
              type="text" 
              placeholder="e.g. $5,000 - $10,000" 
              value={budget}
              onChange={e => setBudget(e.target.value)}
              style={{ width: "100%", padding: "1rem", borderRadius: "12px", background: "#111827", color: "white", border: "1px solid rgba(255,255,255,0.1)", outline: "none" }}
            />
          </div>
          <div>
            <label style={{ display: "block", color: "#9CA3AF", fontSize: "0.85rem", marginBottom: "0.5rem" }}>Timeline</label>
            <input 
              type="text" 
              placeholder="e.g. 3 months" 
              value={timeline}
              onChange={e => setTimeline(e.target.value)}
              style={{ width: "100%", padding: "1rem", borderRadius: "12px", background: "#111827", color: "white", border: "1px solid rgba(255,255,255,0.1)", outline: "none" }}
            />
          </div>
       </div>
       <div style={{ display: "flex", gap: "1rem", marginTop: "3rem" }}>
        <button onClick={prevStep} style={{ flex: 1, padding: "1rem", borderRadius: "12px", background: "rgba(255,255,255,0.05)", color: "white", fontWeight: 600, border: "none", cursor: "pointer" }}>Back</button>
        <button onClick={nextStep} disabled={!productType} style={{ flex: 2, padding: "1rem", borderRadius: "12px", background: productType ? "#3B82F6" : "#1D4ED8", opacity: productType ? 1 : 0.5, color: "white", fontWeight: 700, border: "none", cursor: productType ? "pointer" : "default" }}>Analyze with AI</button>
      </div>
    </div>
  );

  const FreelancerDetailsStep = () => (
    <div style={{ maxWidth: "500px", margin: "0 auto" }}>
       <h2 style={{ fontSize: "1.75rem", fontWeight: 800, color: "white", textAlign: "center", marginBottom: "2rem" }}>Profile Setup</h2>
       <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div>
            <label style={{ display: "block", color: "#9CA3AF", fontSize: "0.85rem", marginBottom: "0.5rem" }}>Skills (comma separated)</label>
            <input 
              type="text" 
              placeholder="React, Node.js, UI/UX, AI" 
              value={skills}
              onChange={e => setSkills(e.target.value)}
              style={{ width: "100%", padding: "1rem", borderRadius: "12px", background: "#111827", color: "white", border: "1px solid rgba(255,255,255,0.1)", outline: "none" }}
            />
          </div>
          <div>
            <label style={{ display: "block", color: "#9CA3AF", fontSize: "0.85rem", marginBottom: "0.5rem" }}>Experience Level</label>
            <select 
              value={experience} 
              onChange={e => setExperience(e.target.value)}
              style={{ width: "100%", padding: "1rem", borderRadius: "12px", background: "#111827", color: "white", border: "1px solid rgba(255,255,255,0.1)", outline: "none" }}
            >
              <option value="">Select experience</option>
              <option value="Junior">Junior (0-2 years)</option>
              <option value="Intermediate">Mid-level (2-5 years)</option>
              <option value="Senior">Senior (5+ years)</option>
              <option value="Expert">Expert / Lead</option>
            </select>
          </div>
       </div>
       <div style={{ display: "flex", gap: "1rem", marginTop: "3rem" }}>
        <button onClick={prevStep} style={{ flex: 1, padding: "1rem", borderRadius: "12px", background: "rgba(255,255,255,0.05)", color: "white", fontWeight: 600, border: "none", cursor: "pointer" }}>Back</button>
        <button onClick={nextStep} disabled={!skills || !experience} style={{ flex: 2, padding: "1rem", borderRadius: "12px", background: (skills && experience) ? "#3B82F6" : "#1D4ED8", opacity: (skills && experience) ? 1 : 0.5, color: "white", fontWeight: 700, border: "none", cursor: (skills && experience) ? "pointer" : "default" }}>Optimize with AI</button>
      </div>
    </div>
  );

  const AIProcessingStep = () => (
    <div style={{ textAlign: "center", maxWidth: "500px", margin: "0 auto" }}>
      <div style={{ position: "relative", width: "120px", height: "120px", margin: "0 auto 3rem" }}>
        <div style={{ position: "absolute", inset: 0, border: "4px solid #1F2937", borderRadius: "50%" }} />
        <div style={{ position: "absolute", inset: 0, border: "4px solid transparent", borderTopColor: "#3B82F6", borderRadius: "50%", animation: "spin 2s linear infinite" }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Bot size={40} color="#3B82F6" />
        </div>
      </div>
      <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "white", marginBottom: "1rem" }}>Adeel AI is working...</h2>
      <p style={{ color: "#9CA3AF", lineHeight: 1.6 }}>
        {role === "client" 
          ? "We're generating your initial project brief, tech stack recommendations, and milestone projections."
          : "We're optimizing your profile, identifying skill gaps, and generating an AI-ready portfolio description."}
      </p>
      <style jsx>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );

  const CompleteStep = () => (
    <div style={{ textAlign: "center", maxWidth: "500px", margin: "0 auto" }}>
      <div style={{ width: "80px", height: "80px", background: "#10B98122", borderRadius: "24px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 2rem" }}>
        <CheckCircle2 size={40} color="#10B981" />
      </div>
      <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "white", marginBottom: "1rem" }}>You're all set!</h1>
      <p style={{ color: "#9CA3AF", lineHeight: 1.6, marginBottom: "2.5rem" }}>
        Your personalized AI environment is ready. Welcome to the future of product development.
      </p>
      <button 
        onClick={() => router.push(`/dashboard/${role}`)}
        style={{ width: "100%", padding: "1rem", borderRadius: "12px", background: "#3B82F6", color: "white", fontWeight: 700, border: "none", cursor: "pointer" }}
      >
        Go to Dashboard
      </button>
    </div>
  );

  return (
    <main style={{ minHeight: "100vh", background: "#0B0C10", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div style={{ width: "100%", maxWidth: "800px" }}>
        {step === "welcome" && <WelcomeStep />}
        {step === "role" && <RoleStep />}
        {step === "client-details" && <ClientDetailsStep />}
        {step === "freelancer-details" && <FreelancerDetailsStep />}
        {step === "ai-processing" && <AIProcessingStep />}
        {step === "complete" && <CompleteStep />}
      </div>
    </main>
  );
}
