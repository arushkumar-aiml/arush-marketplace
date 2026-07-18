import { getAuth } from "firebase-admin/auth";
import type { NextRequest } from "next/server";
import { ADMIN_EMAIL } from "./adminConstants";
import { getAdminDb } from "./firebase-admin";

export async function isAdminRequest(req: NextRequest): Promise<boolean> {
    const authorization = req.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
        return false;
    }

    const idToken = authorization.slice("Bearer ".length).trim();
    if (!idToken) {
        return false;
    }

    getAdminDb();
    const decodedToken = await getAuth().verifyIdToken(idToken);
    return decodedToken.email?.toLowerCase() === ADMIN_EMAIL;
}
