"use client";
import RequireRole from "../../../../components/RequireRole";
import ComingSoon from "../../../../components/dashboard/ComingSoon";

export default function PaymentsPage() {
    return (
        <RequireRole role="freelancer">
            <ComingSoon pageName="Payments" />
        </RequireRole>
    );
}