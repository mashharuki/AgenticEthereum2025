import { HumanMessage } from "@langchain/core/messages";
import { ChatGroq } from "@langchain/groq";
import { MemorySaver } from "@langchain/langgraph";
import { type ToolNode, createReactAgent } from "@langchain/langgraph/prebuilt";
import * as dotenv from "dotenv";

dotenv.config();

const { Groq_API_Key } = process.env;

/**
 * Method for creating an AI Agent instance in ChatGroq
 */
export const createChatGrogAgent = async (
  tools: ToolNode,
  systemPrompt: string,
) => {
  // Create an LLM instance
  const llm = new ChatGroq({ model: "llama3-70b-8192", apiKey: Groq_API_Key });
  // Create a MemoryServer instance
  const agentCheckpointer = new MemorySaver();

  // Create an instance for AI Agent
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
 * Method for executing ChatGroq's AI Agent
 */
export const runChatGroqAgent = async (
  tools: ToolNode,
  systemPrompt: string,
  prompt: string,
) => {
  // Create an Agent
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
