"use client";

import { useEffect, useState, useRef } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../lib/useAuth";
import { useConversations } from "../../lib/useConversations";
import type { ChatMessage } from "../../types/conversation";
import { Send } from "lucide-react";

export default function MessagesView() {
  const { user, profile } = useAuth();
  const { conversations, loading } = useConversations();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const activeConversation = conversations.find((c) => c.id === activeId);

  useEffect(() => {
    if (!activeId) {
      setMessages([]);
      return;
    }
    const q = query(
      collection(db, "conversations", activeId, "messages"),
      orderBy("createdAt", "asc")
    );
    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as ChatMessage));
        setError("");
      },
      () => setError("Messages could not be loaded. Please refresh and try again.")
    );
    return () => unsubscribe();
  }, [activeId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || !activeId || !user || !profile || sending) return;
    setSending(true);
    setError("");

    try {
      const createdAt = Date.now();
      await addDoc(collection(db, "conversations", activeId, "messages"), {
        senderId: user.uid,
        senderName: profile.displayName,
        text: trimmed,
        createdAt,
      });

      await updateDoc(doc(db, "conversations", activeId), {
        lastMessage: trimmed,
        lastMessageAt: createdAt,
      });
      setInput("");
    } catch (err) {
      console.error("Unable to send message:", err);
      setError("Your message was not sent. Please try again.");
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") handleSend();
  }

  return (
    <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
      {/* Conversation list */}
      <div style={{ width: "300px", flexShrink: 0, borderRight: "1px solid #E8E9ED", overflowY: "auto" }}>
        {loading ? (
          <p style={{ padding: "1.5rem", color: "#7A7C87", fontSize: "0.9rem" }}>Loading...</p>
        ) : conversations.length === 0 ? (
          <p style={{ padding: "1.5rem", color: "#7A7C87", fontSize: "0.9rem" }}>
            No conversations yet. They start automatically when a proposal is accepted.
          </p>
        ) : (
          conversations.map((c) => {
            const otherName = profile?.role === "client" ? c.freelancerName : c.clientName;
            return (
              <div
                key={c.id}
                onClick={() => setActiveId(c.id)}
                style={{
                  padding: "1rem 1.25rem",
                  borderBottom: "1px solid #E8E9ED",
                  cursor: "pointer",
                  background: activeId === c.id ? "#EFF3FF" : "white",
                }}
              >
                <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "#12131A", marginBottom: "0.2rem" }}>
                  {otherName}
                </div>
                <div style={{ fontSize: "0.75rem", color: "#7A7C87", marginBottom: "0.3rem" }}>
                  {c.projectTitle}
                </div>
                <div style={{ fontSize: "0.8rem", color: "#4A4C56", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {c.lastMessage || "No messages yet"}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Thread */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {!activeConversation ? (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#9A9CA5" }}>
            Select a conversation to start chatting
          </div>
        ) : (
          <>
            <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid #E8E9ED" }}>
              <div style={{ fontWeight: 600, color: "#12131A" }}>
                {profile?.role === "client" ? activeConversation.freelancerName : activeConversation.clientName}
              </div>
              <div style={{ fontSize: "0.8rem", color: "#7A7C87" }}>{activeConversation.projectTitle}</div>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.9rem" }}>
              {error && <p role="alert" style={{ margin: 0, color: "#DC2626", fontSize: "0.82rem" }}>{error}</p>}
              {messages.map((m) => {
                const isMe = m.senderId === user?.uid;
                return (
                  <div key={m.id} style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start" }}>
                    <div
                      style={{
                        maxWidth: "70%",
                        borderRadius: "14px",
                        padding: "0.65rem 0.95rem",
                        fontSize: "0.9rem",
                        background: isMe ? "#2563EB" : "#F7F8FA",
                        color: isMe ? "white" : "#12131A",
                      }}
                    >
                      {m.text}
                      <div style={{ fontSize: "0.65rem", opacity: 0.7, marginTop: "0.3rem" }}>
                        {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid #E8E9ED", display: "flex", gap: "0.5rem" }}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={sending}
                placeholder="Type a message..."
                style={{ flex: 1, padding: "0.7rem 1rem", borderRadius: "10px", border: "1px solid #E8E9ED", outline: "none", fontSize: "0.9rem" }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || sending}
                style={{ width: "42px", height: "42px", borderRadius: "10px", background: "#2563EB", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: sending ? "default" : "pointer", opacity: sending ? 0.65 : 1 }}
              >
                <Send size={17} color="white" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
