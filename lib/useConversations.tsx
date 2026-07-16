"use client";

import { useEffect, useState } from "react";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";
import { useAuth } from "./useAuth";
import type { Conversation } from "../types/conversation";

export function useConversations() {
  const { user, profile } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !profile) {
      setLoading(false);
      return;
    }

    const field = profile.role === "client" ? "clientId" : "freelancerId";
    const q = query(
      collection(db, "conversations"),
      where(field, "==", user.uid),
      orderBy("lastMessageAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      setConversations(
        snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Conversation)
      );
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, profile]);

  return { conversations, loading };
}