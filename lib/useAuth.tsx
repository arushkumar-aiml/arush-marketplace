"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  onAuthStateChanged,
  User,
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import type { FreelanceWorkType, Occupation, UserProfile, UserRole } from "../types/user";

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
    signup: (
        email: string,
        password: string,
        role: UserRole,
        displayName: string,
        occupation: Occupation,
        freelanceWorkType?: FreelanceWorkType
  ) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  loading: true,
  signup: async () => { },
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        const snap = await getDoc(doc(db, "users", firebaseUser.uid));
        setProfile(snap.exists() ? (snap.data() as UserProfile) : null);
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

    async function signup(
        email: string,
        password: string,
        role: UserRole,
        displayName: string,
        occupation: Occupation,
        freelanceWorkType?: FreelanceWorkType
  ) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName });

    const newProfile: UserProfile = {
      uid: cred.user.uid,
      email,
      displayName,
            role,
            createdAt: Date.now(),
            occupation,
            ...(role === "freelancer" && freelanceWorkType ? { freelanceWorkType } : {}),
            communityClicks: [],
            aiCredits: 0,
    };
    await setDoc(doc(db, "users", cred.user.uid), newProfile);

    await sendEmailVerification(cred.user, {
      url: `${window.location.origin}/verify-email`,
    });

    // onAuthStateChanged listener above will pick up the new user/profile automatically
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signup }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
