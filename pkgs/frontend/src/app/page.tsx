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

// API Endpoinnt
const AUTONOME_CDP_API_ENDPOINT =
  process.env.NEXT_PUBLIC_AUTONOME_CDP_API_ENDPOINT;
const CLOUDRUN_API_ENDPOINT = process.env.NEXT_PUBLIC_CLOUDRUN_API_ENDPOINT;

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

/**
 * Home Component
 * @returns
 */
export default function Home() {
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  /**
   * handleInputChange
   * @param e
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  /**
   * onSubmit method
   * @param e
   * @returns
   */
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;
    setIsGenerating(true);

    // ① Add the user's message to the conversation.
    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      console.log("userMessage", userMessage.content);

      // ① Call Vertex AI Agent endpoints in sequence to social trend analysis.
      const responseA = await fetch(`${CLOUDRUN_API_ENDPOINT}/agentVertexAI`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: userMessage.content,
          operation: "SocialTrend",
        }),
      });
      const textA = await responseA.json();
      console.log("textA", textA);
      const aiAMessage = { role: "assistant", content: textA.result };
      setMessages((prev) => [...prev, aiAMessage]);

      // ② Call Vertex AI Agent endpoint to NewsAndFundamentals analysis.
      const responseB = await fetch(`${CLOUDRUN_API_ENDPOINT}/agentVertexAI`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: textA.result,
          operation: "NewsAndFundamentals",
        }),
      });
      const textB = await responseB.json();
      console.log("textB", textB);
      const aiBMessage = { role: "assistant", content: textB.result };
      setMessages((prev) => [...prev, aiBMessage]);

      // ③ Call Vertex AI Agent endpoint to NewsAndFundamentals analysis.
      const responseC = await fetch(
        `${CLOUDRUN_API_ENDPOINT}/runCryptOpenAIAgent`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: textB.result,
            operation: "RiskManagement",
          }),
        },
      );
      const textC = await responseC.json();
      console.log("textC", textC);
      const aiCMessage = { role: "assistant", content: textC.result };
      setMessages((prev) => [...prev, aiCMessage]);

      // ④ Call Autonome CoinBase AI Agent endpoint to get token balance info
      const responseD = await fetch(
        `${AUTONOME_CDP_API_ENDPOINT}/runCdpChatMode`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Basic Y2RwYWdlbnQ6elhyZVVoV2xxUw==",
          },
          body: JSON.stringify({
            prompt: "What is my wallet's balance (ETH, EURC, USDC) now?",
          }),
        },
      );

      console.log("responseD", responseD);

      const textD = await responseD.json();
      console.log("textD", textD);
      const aiDMessage = { role: "assistant", content: textD.result[1] };
      setMessages((prev) => [...prev, aiDMessage]);

      // concat the messages
      const newMessage = textC.result.concat(textD.result[1]);

      // ⑤ call Groq Agent endpoint to PerformanceMonitoring
      const responseE = await fetch(
        `${CLOUDRUN_API_ENDPOINT}/runChatGroqAgent`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: newMessage,
            operation: "PerformanceMonitoring",
          }),
        },
      );
      const textE = await responseE.json();
      console.log("textE", textE);
      const aiEMessage = { role: "assistant", content: textE.result };
      setMessages((prev) => [...prev, aiEMessage]);

      // ⑤ call OpenAI Agent endpoint to AnalysisAndReasoning
      const responseF = await fetch(
        `${CLOUDRUN_API_ENDPOINT}/runCryptOpenAIAgent`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: textE.result,
            operation: "PerformanceMonitoring",
          }),
        },
      );
      const textF = await responseF.json();
      console.log("textF", textF);
      const aiFMessage = { role: "assistant", content: textF.result };
      setMessages((prev) => [...prev, aiFMessage]);

      // check contain in the response "base sepolia"
      const containsKeywordFlg = textF.result
        .toLowerCase()
        .includes("base sepolia".toLowerCase());

      // ⑥ call OpenAI Agent or Autonome endpoint to execute defi transaction
      if (containsKeywordFlg) {
        // Call Autonome CoinBase AI Agent endpoint to execute defi transaction
        const responseG = await fetch(
          `${AUTONOME_CDP_API_ENDPOINT}/runCdpChatMode`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Basic Y2RwYWdlbnQ6elhyZVVoV2xxUw==",
            },
            body: JSON.stringify({
              prompt: textF.result,
            }),
          },
        );

        console.log("responseG", responseG);

        const textG = await responseG.json();
        console.log("textG", textG);
        const aiGMessage = { role: "assistant", content: textG.result[1] };
        setMessages((prev) => [...prev, aiGMessage]);
      } else {
        // Call ChatGPT AI Agent endpoint to execute defi transaction
        const responseH = await fetch(
          `${CLOUDRUN_API_ENDPOINT}/runCryptOpenAIAgent`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              prompt: textF.result,
            }),
          },
        );
        const textH = await responseH.json();
        console.log("textH", textH);
        const aiHMessage = { role: "assistant", content: textH.result };
        setMessages((prev) => [...prev, aiHMessage]);
      }
    } catch (error) {
      console.error("Error during conversation chain:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * onKeyDown method
   * @param e
   * @returns
   */
  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (isGenerating || !input) return;
      setIsGenerating(true);
      onSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
    }
  };

  /**
   * handleActionClick method
   * @param action
   * @param messageIndex
   */
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

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, []);

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
