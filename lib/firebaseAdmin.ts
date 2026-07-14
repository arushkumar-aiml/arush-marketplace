import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const base64ServiceAccount = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_BASE64;

if (!base64ServiceAccount) {
    console.error("Missing FIREBASE_ADMIN_SERVICE_ACCOUNT_BASE64 environment variable");
}

const serviceAccount = base64ServiceAccount
    ? JSON.parse(Buffer.from(base64ServiceAccount, "base64").toString("utf-8"))
    : null;

const adminApp =
    getApps().length > 0
        ? getApps()[0]
        : initializeApp({
              credential: cert(serviceAccount),
          });

export const adminDb = getFirestore(adminApp);