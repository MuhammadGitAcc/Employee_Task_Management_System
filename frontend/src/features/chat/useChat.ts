import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError } from "~/services/api";
import * as chatApi from "~/services/chat";
import { connectChatSocket } from "~/services/chatSocket";
import type { SocketStatus } from "~/services/chatSocket";
import { mergeMessages } from "./chat.messages";
import type { ChatMessage } from "./chat.types";

type LoadStatus = "loading" | "ready" | "error";

export const useChat = (channelId: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [connection, setConnection] = useState<SocketStatus>("connecting");
  const [attempt, setAttempt] = useState(0);
  const channelIdRef = useRef(channelId);

  useEffect(() => {
    channelIdRef.current = channelId;
  }, [channelId]);

  useEffect(() => {
    let cancelled = false;
    setMessages([]);
    setStatus("loading");
    chatApi
      .listMessages(channelId)
      .then((list) => {
        if (cancelled) return;
        setMessages((previous) => mergeMessages(previous, list));
        setStatus("ready");
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setErrorMessage(
          error instanceof ApiError
            ? error.message
            : "Could not load the messages."
        );
        setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [channelId, attempt]);

  // One socket for the whole chat page: it keeps itself connected and every
  // time it (re)opens, the messages sent in the meantime are loaded again
  useEffect(() => {
    const resync = () => {
      const target = channelIdRef.current;
      chatApi
        .listMessages(target)
        .then((list) => {
          if (channelIdRef.current !== target) return;
          setMessages((previous) => mergeMessages(previous, list));
          setStatus("ready");
        })
        .catch(() => {});
    };

    return connectChatSocket({
      onMessage: (message) => {
        if (message.channelId !== channelIdRef.current) return;
        setMessages((previous) => mergeMessages(previous, [message]));
      },
      onStatus: (next) => {
        setConnection(next);
        if (next === "open") resync();
      },
    });
  }, []);

  const reload = useCallback(() => {
    setAttempt((previous) => previous + 1);
  }, []);

  const send = useCallback(
    async (text: string): Promise<void> => {
      const created = await chatApi.sendMessage(channelId, text);
      if (created.channelId !== channelIdRef.current) return;
      setMessages((previous) => mergeMessages(previous, [created]));
    },
    [channelId]
  );

  return { messages, status, errorMessage, connection, reload, send };
};
