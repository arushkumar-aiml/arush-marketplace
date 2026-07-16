import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

type ServiceAccount = {
    project_id?: string;
    projectId?: string;
    client_email?: string;
    clientEmail?: string;
    private_key?: string;
    privateKey?: string;
};

let adminApp: App | null = null;
let adminFirestore: Firestore | null = null;

function getServiceAccount() {
    const base64ServiceAccount = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_BASE64;

    if (base64ServiceAccount) {
        try {
            const serviceAccount = JSON.parse(
                Buffer.from(base64ServiceAccount, "base64").toString("utf-8")
            ) as ServiceAccount;
            const privateKey = serviceAccount.private_key ?? serviceAccount.privateKey;

            return {
                projectId: serviceAccount.project_id ?? serviceAccount.projectId,
                clientEmail: serviceAccount.client_email ?? serviceAccount.clientEmail,
                privateKey: privateKey?.replace(/\\n/g, "\n"),
            };
        } catch (error) {
            throw new Error(
                "Invalid FIREBASE_ADMIN_SERVICE_ACCOUNT_BASE64. It must be a base64-encoded Firebase service account JSON.",
                { cause: error }
            );
        }
    }

    const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = process.env;

    if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
        throw new Error(
            "Missing Firebase Admin credentials. Set FIREBASE_ADMIN_SERVICE_ACCOUNT_BASE64 or FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY."
        );
    }

    return {
        projectId: FIREBASE_PROJECT_ID,
        clientEmail: FIREBASE_CLIENT_EMAIL,
        privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    };
}

function getAdminApp() {
    if (adminApp) {
        return adminApp;
    }

    const existingApp = getApps()[0];
    if (existingApp) {
        adminApp = existingApp;
        return adminApp;
    }

    adminApp = initializeApp({
        credential: cert(getServiceAccount()),
    });

    return adminApp;
}

export function getAdminDb() {
    if (!adminFirestore) {
        adminFirestore = getFirestore(getAdminApp());
    }

    return adminFirestore;
}

export const adminDb = new Proxy({} as Firestore, {
    get(_target, prop, receiver) {
        return Reflect.get(getAdminDb(), prop, receiver);
    },
});
