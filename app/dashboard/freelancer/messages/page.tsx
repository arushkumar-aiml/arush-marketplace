"use client";

export const dynamic = "force-dynamic";

import Sidebar from "../../../../components/dashboard/Sidebar";
import DashboardHeader from "../../../../components/dashboard/DashboardHeader";
import MessagesView from "../../../../components/dashboard/MessagesView";
import RequireRole from "../../../../components/RequireRole";

function FreelancerMessagesContent() {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "white" }}>
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <DashboardHeader subtitle="Chat with clients on your projects." />
        <MessagesView />
      </div>
    </div>
  );
}

export default function FreelancerMessagesPage() {
  return (
    <RequireRole role="freelancer">
      <FreelancerMessagesContent />
    </RequireRole>
  );
}