import { getAdminDb } from "./firebase-admin";

/**
 * Atomically deducts AI credits from a user's Firestore profile.
 * Returns false when the user does not have enough credits.
 */
export async function deductCredits(userId: string, amount: number): Promise<boolean> {
    if (!userId || !Number.isInteger(amount) || amount <= 0) {
        return false;
    }

    const db = getAdminDb();
    const userRef = db.collection("users").doc(userId);

    return db.runTransaction(async (transaction) => {
        const userSnapshot = await transaction.get(userRef);

        if (!userSnapshot.exists) {
            return false;
        }

        const currentCredits = userSnapshot.data()?.aiCredits;
        if (typeof currentCredits !== "number" || currentCredits < amount) {
            return false;
        }

        transaction.update(userRef, { aiCredits: currentCredits - amount });
        return true;
    });
}
