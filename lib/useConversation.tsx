"use client";
import { useState, useEffect } from "react";
import {
  collection, doc, query, where, orderBy, onSnapshot,
  addDoc, setDoc, serverTimestamp, getDocs,
} from "firebase/firestore";
import { db } from "./firebase";

export interface Message {
  id: string;
  senderId: string;
  text: string;
  createdAt: any;
}

export interface Conversation {
  id: string;
  participants: string[];
  projectId: string;
  lastMessage: string;
  lastMessageAt: any;
}

export function useConversations(userId: string | undefined) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    const q = query(
      collection(db, "conversations"),
      where("participants", "array-contains", userId),
      orderBy("lastMessageAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setConversations(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Conversation)));
      setLoading(false);
    });
    return () => unsub();
  }, [userId]);

  return { conversations, loading };
}

export function useMessages(conversationId: string | undefined) {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (!conversationId) return;
    const q = query(
      collection(db, "conversations", conversationId, "messages"),
      orderBy("createdAt", "asc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Message)));
    });
    return () => unsub();
  }, [conversationId]);

  return messages;
}

export async function sendMessage(conversationId: string, senderId: string, text: string) {
  if (!text.trim()) return;

  await addDoc(collection(db, "conversations", conversationId, "messages"), {
    senderId,
    text: text.trim(),
    createdAt: serverTimestamp(),
  });

  await setDoc(
    doc(db, "conversations", conversationId),
    { lastMessage: text.trim(), lastMessageAt: serverTimestamp() },
    { merge: true }
  );
}

export async function getOrCreateConversation(
  clientId: string,
  freelancerId: string,
  projectId: string
): Promise<string> {
  const q = query(
    collection(db, "conversations"),
    where("projectId", "==", projectId),
    where("participants", "array-contains", clientId)
  );
  const snap = await getDocs(q);
  const existing = snap.docs.find((d) => d.data().participants.includes(freelancerId));
  if (existing) return existing.id;

  const newConvo = await addDoc(collection(db, "conversations"), {
    participants: [clientId, freelancerId],
    projectId,
    lastMessage: "",
    lastMessageAt: serverTimestamp(),
    createdAt: serverTimestamp(),
  });
  return newConvo.id;
}