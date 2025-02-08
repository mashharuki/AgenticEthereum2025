import { HumanMessage } from "@langchain/core/messages";
import { ChatGroq } from "@langchain/groq";
import { MemorySaver } from "@langchain/langgraph";
import { type ToolNode, createReactAgent } from "@langchain/langgraph/prebuilt";
import * as dotenv from "dotenv";

dotenv.config();

const { Groq_API_Key } = process.env;

/**
 * ChatGroqのAI Agentインスタンスを作成するメソッド
 */
export const createChatGrogAgent = async (
  tools: ToolNode,
  systemPrompt: string,
) => {
  // LLM インスタンスを生成
  const llm = new ChatGroq({ model: "llama3-70b-8192", apiKey: Groq_API_Key });
  // MemoryServerインスタンスを生成
  const agentCheckpointer = new MemorySaver();

  // AI Agent用のインスタンスを生成
  const agent = createReactAgent({
    // @ts-ignore
    llm: llm,
    tools: tools,
    checkpointSaver: agentCheckpointer,
    messageModifier: systemPrompt,
  });

  return agent;
};

/**
 * ChatGroqのAI Agentを実行するメソッド
 */
export const runChatGroqAgent = async (
  tools: ToolNode,
  systemPrompt: string,
  prompt: string,
) => {
  // Agentを生成
  const agent = await createChatGrogAgent(tools, systemPrompt);

  const result = await agent.invoke(
    { messages: [new HumanMessage(prompt)] },
    { configurable: { thread_id: "43" } },
  );

  const response =
    result.messages[result.messages.length - 1].content.toString();

  console.log("Result:", response);

  return response;
};
