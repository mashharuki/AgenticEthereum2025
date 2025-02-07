"use client";

import { Button } from "@/components/ui/button";
import {
  ChatBubble,
  ChatBubbleAction,
  ChatBubbleAvatar,
  ChatBubbleMessage,
} from "@/components/ui/chat/chat-bubble";
import { ChatInput } from "@/components/ui/chat/chat-input";
import { ChatMessageList } from "@/components/ui/chat/chat-message-list";
import {
  CopyIcon,
  CornerDownLeft,
  Mic,
  Paperclip,
  RefreshCcw,
  Volume2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

const ChatAiIcons = [
  {
    icon: CopyIcon,
    label: "Copy",
  },
  {
    icon: RefreshCcw,
    label: "Refresh",
  },
  {
    icon: Volume2,
    label: "Volume",
  },
];

interface Message {
  role: string;
  content: string;
}

export default function Home() {
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, []);

  // ユーザーのメッセージを起点に A→B→C の順番で会話を行う例
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;
    setIsGenerating(true);

    // ① ユーザーのメッセージを会話に追加
    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      // ② chatA エンドポイントへリクエスト
      const responseA = await fetch("/api/chatA", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [userMessage] }),
      });
      const textA = await responseA.json();
      const aiAMessage = { role: "assistant", content: textA.text };
      setMessages((prev) => [...prev, aiAMessage]);

      // ③ chatB エンドポイントへリクエスト（ユーザーのメッセージ＋Aの返答を渡す）
      const responseB = await fetch("/api/chatB", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [userMessage, aiAMessage] }),
      });
      const textB = await responseB.json();
      const aiBMessage = { role: "assistant", content: textB.text };
      setMessages((prev) => [...prev, aiBMessage]);

      // ④ chatC エンドポイントへリクエスト（これまでの会話履歴を渡す）
      const responseC = await fetch("/api/chatC", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [userMessage, aiAMessage, aiBMessage],
        }),
      });
      const textC = await responseC.json();
      const aiCMessage = { role: "assistant", content: textC.text };
      setMessages((prev) => [...prev, aiCMessage]);
    } catch (error) {
      console.error("Error during conversation chain:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (isGenerating || !input) return;
      setIsGenerating(true);
      onSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
    }
  };

  const handleActionClick = async (action: string, messageIndex: number) => {
    console.log("Action clicked:", action, "Message index:", messageIndex);
    if (action === "Refresh") {
      setIsGenerating(true);
      // try {
      //   // 必要に応じてリロード処理を追加
      //   await reload();

      // } catch (error) {
      //   console.error("Error reloading:", error);
      // } finally {
      setIsGenerating(false);
      // }
    }
    if (action === "Copy") {
      const message = messages[messageIndex];
      if (message && message.role === "assistant") {
        navigator.clipboard.writeText(message.content);
      }
    }
  };

  return (
    <main className="flex h-screen w-full max-w-3xl flex-col items-center mx-auto">
      <div className="flex-1 w-full overflow-y-auto py-6" ref={messagesRef}>
        <ChatMessageList>
          {messages?.map((message, index) => (
            <ChatBubble
              key={message.content}
              variant={message.role === "user" ? "sent" : "received"}
            >
              <ChatBubbleAvatar
                src=""
                fallback={message.role === "user" ? "👨🏽" : "🤖"}
              />
              <ChatBubbleMessage>
                {message.content
                  .split("```")
                  .map((part: string, index: number) => {
                    if (index % 2 === 0) {
                      return (
                        <Markdown key={part} remarkPlugins={[remarkGfm]}>
                          {part}
                        </Markdown>
                      );
                    }
                    return (
                      <pre className="whitespace-pre-wrap pt-2" key={part}>
                        {/* コードブロック表示用のコンポーネントを挿入 */}
                      </pre>
                    );
                  })}

                {message.role === "assistant" &&
                  messages.length - 1 === index && (
                    <div className="flex items-center mt-1.5 gap-1">
                      {!isGenerating &&
                        ChatAiIcons.map((icon) => {
                          const Icon = icon.icon;
                          return (
                            <ChatBubbleAction
                              variant="outline"
                              className="size-5"
                              key={icon.icon.displayName}
                              icon={<Icon className="size-3" />}
                              onClick={() =>
                                handleActionClick(icon.label, index)
                              }
                            />
                          );
                        })}
                    </div>
                  )}
              </ChatBubbleMessage>
            </ChatBubble>
          ))}

          {isGenerating && (
            <ChatBubble variant="received">
              <ChatBubbleAvatar src="" fallback="🤖" />
              <ChatBubbleMessage isLoading />
            </ChatBubble>
          )}
        </ChatMessageList>
      </div>

      <div className="w-full px-4 pb-4">
        <form
          ref={formRef}
          onSubmit={onSubmit}
          className="relative rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring"
        >
          <ChatInput
            value={input}
            onKeyDown={onKeyDown}
            onChange={handleInputChange}
            placeholder="Type your message here..."
            className="rounded-lg bg-background border-0 shadow-none focus-visible:ring-0"
          />
          <div className="flex items-center p-3 pt-0">
            <Button variant="ghost" size="icon">
              <Paperclip className="size-4" />
              <span className="sr-only">Attach file</span>
            </Button>
            <Button variant="ghost" size="icon">
              <Mic className="size-4" />
              <span className="sr-only">Use Microphone</span>
            </Button>
            <Button
              disabled={!input || isGenerating}
              type="submit"
              size="sm"
              className="ml-auto gap-1.5"
            >
              Send Message
              <CornerDownLeft className="size-3.5" />
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}
