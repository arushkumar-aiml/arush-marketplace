import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "../../../../lib/adminAuth";
import { getAdminDb } from "../../../../lib/firebase-admin";

export async function GET(req: NextRequest) {
    try {
        if (!(await isAdminRequest(req))) {
            return NextResponse.json({ error: "Not authorized" }, { status: 403 });
        }

        const db = getAdminDb();
        const [users, projects, applications, conversations] = await Promise.all([
            db.collection("users").count().get(),
            db.collection("projects").count().get(),
            db.collection("applications").count().get(),
            db.collection("conversations").count().get(),
        ]);

        return NextResponse.json({
            users: users.data().count,
            projects: projects.data().count,
            applications: applications.data().count,
            conversations: conversations.data().count,
        });
    } catch (err: unknown) {
        console.error("Admin stats route error:", err);
        return NextResponse.json({ error: "Unable to load admin statistics" }, { status: 500 });
    }
}
