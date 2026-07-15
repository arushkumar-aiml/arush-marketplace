"use client";
import { useState, useRef, useEffect } from "react";
import { useTheme } from "../../lib/useTheme";
import { useConversations, useMessages, sendMessage } from "../../lib/useConversation";
import { MessageCircle, Send } from "lucide-react";

export default function MessagesView({ currentUserId }: { currentUserId: string }) {
  const { colors } = useTheme();
  const { conversations, loading } = useConversations(currentUserId);
  const [activeId, setActiveId] = useState<string | null>(null);
  const messages = useMessages(activeId || undefined);
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!text.trim() || !activeId) return;
    const toSend = text;
    setText("");
    await sendMessage(activeId, currentUserId, toSend);
  };

  return (
    <div style={{ display: "flex", height: "calc(100vh - 140px)", border: `1px solid ${colors.border}`, borderRadius: "16px", overflow: "hidden" }}>
      {/* Conversation list */}
      <div style={{ width: "300px", borderRight: `1px solid ${colors.border}`, overflowY: "auto", background: colors.bgSecondary }}>
        {loading && (
          <p style={{ padding: "1.25rem", color: colors.textMuted, fontSize: "0.85rem" }}>Loading...</p>
        )}
        {!loading && conversations.length === 0 && (
          <div style={{ padding: "1.5rem", textAlign: "center" }}>
            <MessageCircle size={24} color={colors.textMuted} style={{ marginBottom: "0.5rem" }} />
            <p style={{ color: colors.textMuted, fontSize: "0.85rem" }}>No conversations yet.</p>
          </div>
        )}
        {conversations.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveId(c.id)}
            style={{
              width: "100%",
              textAlign: "left",
              padding: "1rem 1.25rem",
              borderBottom: `1px solid ${colors.border}`,
              background: activeId === c.id ? colors.bgPrimary : "transparent",
              border: "none",
              borderBottomWidth: "1px",
              cursor: "pointer",
            }}
          >
            <p style={{
              fontSize: "0.85rem",
              fontWeight: 600,
              color: colors.textPrimary,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}>
              {c.lastMessage || "Start the conversation"}
            </p>
          </button>
        ))}
      </div>

      {/* Active chat */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", background: colors.bgPrimary }}>
        {!activeId ? (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: colors.textMuted, fontSize: "0.9rem" }}>
            Select a conversation
          </div>
        ) : (
          <>
            <div style={{ flex: 1, overflowY: "auto", padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {messages.map((m) => (
                <div
                  key={m.id}
                  style={{
                    maxWidth: "70%",
                    alignSelf: m.senderId === currentUserId ? "flex-end" : "flex-start",
                    background: m.senderId === currentUserId ? colors.accentBlue : colors.bgSecondary,
                    color: m.senderId === currentUserId ? "#FFFFFF" : colors.textPrimary,
                    padding: "0.6rem 0.9rem",
                    borderRadius: "12px",
                    fontSize: "0.875rem",
                    lineHeight: 1.5,
                  }}
                >
                  {m.text}
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            <div style={{ borderTop: `1px solid ${colors.border}`, padding: "0.85rem", display: "flex", gap: "0.5rem" }}>
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type a message..."
                style={{
                  flex: 1,
                  border: `1px solid ${colors.border}`,
                  borderRadius: "10px",
                  padding: "0.6rem 0.9rem",
                  fontSize: "0.875rem",
                  outline: "none",
                  background: colors.bgSecondary,
                  color: colors.textPrimary,
                }}
              />
              <button
                onClick={handleSend}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  background: colors.accentBlue,
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "10px",
                  padding: "0.6rem 1rem",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                <Send size={14} />
                Send
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}