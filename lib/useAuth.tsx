import { sendEmailVerification } from "firebase/auth";

const signup = async (email: string, password: string, role: string, name: string) => {
  const cred = await createUserWithEmailAndPassword(auth, email, password);

  await setDoc(doc(db, "users", cred.user.uid), {
    email,
    role,
    name,
    createdAt: serverTimestamp(),
  });

  // Send verification email
  await sendEmailVerification(cred.user, {
    url: `${window.location.origin}/verify-email`, // where they land after clicking the link
  });

  router.push("/verify-email");
};