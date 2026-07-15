"use client";
import { useAuth } from "../../../../lib/useAuth";
import { useTheme } from "../../../../lib/useTheme";
import RequireRole from "../../../../components/RequireRole";
import Sidebar from "../../../../components/dashboard/Sidebar";
import DashboardHeader from "../../../../components/dashboard/DashboardHeader";
import MessagesView from "../../../../components/dashboard/MessagesView";

function FreelancerMessagesContent() {
  const { user } = useAuth();
  const { colors } = useTheme();

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: colors.bgPrimary }}>
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <DashboardHeader subtitle="Chat with clients about your active proposals." />
        <div style={{ flex: 1, padding: "2rem" }}>
          {user && <MessagesView currentUserId={user.uid} />}
        </div>
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