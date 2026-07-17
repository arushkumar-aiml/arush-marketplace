import { getAuth } from "firebase-admin/auth";
import type { NextRequest } from "next/server";
import { getAdminDb } from "./firebase-admin";

export async function getAuthenticatedUserId(req: NextRequest): Promise<string | null> {
    const authorization = req.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
        return null;
    }

    const idToken = authorization.slice("Bearer ".length).trim();
    if (!idToken) {
        return null;
    }

    // Ensure the Firebase Admin app is initialized before accessing Auth.
    getAdminDb();
    const decodedToken = await getAuth().verifyIdToken(idToken);
    return decodedToken.uid;
}
