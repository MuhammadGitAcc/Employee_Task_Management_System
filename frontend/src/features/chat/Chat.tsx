import React, { useState } from "react";
import PageContainer from "~/components/layout/PageContainer";
import PageHeader from "~/components/layout/PageHeader";
import Button from "~/components/ui/Button";
import Card from "~/components/ui/Card";
import ErrorState from "~/components/ui/ErrorState";
import Skeleton from "~/components/ui/Skeleton";
import { useToast } from "~/components/ui/toast.context";
import { useAuth } from "~/features/auth/useAuth";
import { getErrorMessage } from "~/services/api";
import ChatBox from "./ChatBox";
import { CHAT_CHANNELS, DEFAULT_CHANNEL_ID } from "./chat.channels";
import { useChat } from "./useChat";

const Chat: React.FC = () => {
  const { showToast } = useToast();
  const { user } = useAuth();
  const [channelId, setChannelId] = useState(DEFAULT_CHANNEL_ID);
  const channel =
    CHAT_CHANNELS.find((item) => item.id === channelId) ?? CHAT_CHANNELS[0];
  const { messages, status, errorMessage, connection, reload, send } = useChat(
    channel.id
  );

  const handleSendMessage = async (text: string): Promise<boolean> => {
    try {
      await send(text);
      return true;
    } catch (error) {
      showToast(getErrorMessage(error), "error");
      return false;
    }
  };

  return (
    <PageContainer size="narrow">
      <PageHeader title="Team Chat" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card as="nav" aria-label="Chat channels" className="self-start">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2 dark:text-gray-400">
            Channels
          </h2>
          <ul className="space-y-1">
            {CHAT_CHANNELS.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => setChannelId(item.id)}
                  aria-current={item.id === channel.id ? "true" : undefined}
                  className={`w-full text-left rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    item.id === channel.id
                      ? "bg-primary-50 text-primary-700 font-medium dark:bg-primary-900/30 dark:text-primary-300"
                      : "text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  # {item.name}
                </button>
              </li>
            ))}
          </ul>
        </Card>
        <Card className="md:col-span-3 h-[480px] md:h-[600px] flex flex-col">
          <div className="pb-3 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              # {channel.name}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {channel.description}
            </p>
            {connection !== "open" && (
              <p
                role="status"
                className="mt-1 text-xs text-amber-600 dark:text-amber-400"
              >
                {connection === "connecting"
                  ? "Connecting..."
                  : "Connection lost. Reconnecting..."}
              </p>
            )}
          </div>
          {status === "loading" && (
            <div
              role="status"
              aria-label="Loading messages"
              className="flex-1 space-y-3 p-4"
            >
              <Skeleton className="h-10 w-2/3" />
              <Skeleton className="ml-auto h-10 w-1/2" />
              <Skeleton className="h-10 w-3/5" />
            </div>
          )}
          {status === "error" && (
            <div className="flex-1 p-4">
              <ErrorState
                title="Could not load the messages"
                description={errorMessage}
                action={<Button onClick={reload}>Try again</Button>}
              />
            </div>
          )}
          {status === "ready" && (
            <ChatBox
              messages={messages}
              currentUserId={user?.id ?? ""}
              channelName={channel.name}
              onSendMessage={handleSendMessage}
            />
          )}
        </Card>
      </div>
    </PageContainer>
  );
};

export default Chat;
