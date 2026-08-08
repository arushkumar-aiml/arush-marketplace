// Service category taxonomy for Arush Marketplace.
// Used by: Post a Project (client picks a category), Freelancer Profile
// (freelancer picks specializations), and eventually Adeel LLM's own
// service-routing logic — this file is the single source of truth so all
// three stay in sync. Update here, everywhere else reads from this.

export interface ServiceCategory {
  group: string;
  services: string[];
}

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    group: "Programming & Tech",
    services: [
      "Web Development",
      "Mobile App Development",
      "Desktop Applications",
      "Game Development",
      "DevOps & CI/CD",
      "QA & Testing",
      "Database Design",
      "API Development",
      "Browser Extensions",
      "Blockchain & Web3",
    ],
  },
  {
    group: "AI & Machine Learning",
    services: [
      "AI Chatbots",
      "LLM Fine-tuning",
      "Computer Vision",
      "AI Automation Agents",
      "Prompt Engineering",
      "Data Labeling",
      "ML Model Deployment",
      "AI Voice Agents",
      "Recommendation Systems",
      "RAG Pipelines",
    ],
  },
  {
    group: "Design & Creative",
    services: [
      "UI/UX Design",
      "Logo Design",
      "Brand Identity",
      "Illustration",
      "Presentation Design",
      "Print Design",
      "Packaging Design",
      "Product Design",
      "Icon Design",
      "3D Modeling",
    ],
  },
  {
    group: "Writing & Content",
    services: [
      "Blog Writing",
      "Copywriting",
      "Technical Writing",
      "Ghostwriting",
      "Proofreading & Editing",
      "Resume Writing",
      "Scriptwriting",
      "Grant Writing",
      "Product Descriptions",
      "Translation",
    ],
  },
  {
    group: "Digital Marketing",
    services: [
      "SEO",
      "Social Media Marketing",
      "PPC & Ads",
      "Email Marketing",
      "Content Marketing",
      "Influencer Marketing",
      "Marketing Strategy",
      "Affiliate Marketing",
      "App Store Optimization",
      "Conversion Rate Optimization",
    ],
  },
  {
    group: "Video & Animation",
    services: [
      "Video Editing",
      "Motion Graphics",
      "Whiteboard Animation",
      "2D Animation",
      "3D Animation",
      "Video Ads",
      "Explainer Videos",
      "Subtitling",
      "Color Grading",
      "Video Production",
    ],
  },
  {
    group: "Music & Audio",
    services: [
      "Voiceover",
      "Music Production",
      "Audio Editing",
      "Sound Design",
      "Podcast Editing",
      "Jingles & Intros",
      "Mixing & Mastering",
      "Audiobook Production",
      "Session Musicians",
      "Songwriting",
    ],
  },
  {
    group: "Business & Consulting",
    services: [
      "Business Plans",
      "Market Research",
      "Virtual Assistance",
      "Financial Consulting",
      "Legal Consulting",
      "HR Consulting",
      "Project Management",
      "Business Analysis",
      "Data Entry",
      "Bookkeeping",
    ],
  },
  {
    group: "Security & DevOps",
    services: [
      "Penetration Testing",
      "Security Audits",
      "Cloud Infrastructure",
      "Site Reliability Engineering",
      "Malware Analysis",
      "Compliance Consulting",
      "Network Security",
      "Container Orchestration",
      "Incident Response",
    ],
  },
  {
    group: "Education & Training",
    services: [
      "Online Tutoring",
      "Course Creation",
      "Curriculum Design",
      "Corporate Training",
      "Language Teaching",
      "Test Prep",
      "Technical Workshops",
      "E-learning Development",
      "Career Coaching",
    ],
  },
];

// Flat list of every individual service — useful for search/matching logic.
export const ALL_SERVICES: string[] = SERVICE_CATEGORIES.flatMap((c) => c.services);
