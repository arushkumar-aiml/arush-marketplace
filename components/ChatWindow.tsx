"use client";
import { useState, useRef, useEffect } from "react";
import { useMessages, sendMessage } from "@/lib/useConversation";

export default function ChatWindow({
  conversationId,
  currentUserId,
}: {
  conversationId: string;
  currentUserId: string;
}) {
  const messages = useMessages(conversationId);
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!text.trim()) return;
    const toSend = text;
    setText(""); // clear immediately, feels faster
    await sendMessage(conversationId, currentUserId, toSend);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`max-w-[70%] px-3 py-2 rounded-lg ${
              m.senderId === currentUserId
                ? "ml-auto bg-black text-white"
                : "bg-gray-100"
            }`}
          >
            {m.text}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="border-t p-3 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type a message..."
          className="flex-1 border rounded px-3 py-2"
        />
        <button
          onClick={handleSend}
          className="px-4 py-2 bg-black text-white rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
}