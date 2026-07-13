"use client";
import RequireRole from "../../../../components/RequireRole";
import ComingSoon from "../../../../components/dashboard/ComingSoon";

export default function MessagesPage() {
    return (
        <RequireRole role="freelancer">
            <ComingSoon pageName="Messages" />
        </RequireRole>
    );
}