import React, { useEffect, useRef, useState } from "react";
import Button from "~/components/ui/Button";
import { formatMessageTime } from "./chat.format";
import type { ChatMessage } from "./chat.types";

interface ChatBoxProps {
  messages: ChatMessage[];
  currentUserId: string;
  channelName: string;
  onSendMessage: (text: string) => Promise<boolean>;
}

const MESSAGE_MAX_LENGTH = 500;

const ChatBox: React.FC<ChatBoxProps> = ({
  messages,
  currentUserId,
  channelName,
  onSendMessage,
}) => {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = message.trim();
    if (!trimmed || sending) return;
    setSending(true);
    const sent = await onSendMessage(trimmed);
    setSending(false);
    if (sent) setMessage("");
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div
        ref={listRef}
        role="log"
        aria-live="polite"
        tabIndex={0}
        aria-label={`${channelName} messages`}
        className="flex-1 overflow-y-auto p-4 space-y-3"
      >
        {messages.length === 0 ? (
          <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
            No messages yet. Say hello!
          </p>
        ) : (
          messages.map((msg) => {
            const own = msg.senderId === currentUserId;
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${own ? "items-end" : "items-start"}`}
              >
                <span className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                  {own ? "You" : msg.sender} ·{" "}
                  {formatMessageTime(msg.createdAt)}
                </span>
                <p
                  className={`max-w-[80%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap break-words ${
                    own
                      ? "bg-primary-600 text-white"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100"
                  }`}
                >
                  {msg.text}
                </p>
              </div>
            );
          })
        )}
      </div>
      <form
        onSubmit={handleSubmit}
        className="flex gap-2 border-t border-gray-200 pt-4 dark:border-gray-700"
      >
        <label htmlFor="chat-message" className="sr-only">
          Message
        </label>
        <input
          id="chat-message"
          type="text"
          value={message}
          maxLength={MESSAGE_MAX_LENGTH}
          onChange={(e) => setMessage(e.target.value)}
          className="min-w-0 flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
          placeholder={`Message #${channelName}`}
        />
        <Button
          type="submit"
          className="shrink-0"
          disabled={!message.trim() || sending}
        >
          Send
        </Button>
      </form>
    </div>
  );
};

export default ChatBox;
