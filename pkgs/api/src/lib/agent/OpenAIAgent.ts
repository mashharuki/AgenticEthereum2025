import { HumanMessage } from "@langchain/core/messages";
import { MemorySaver } from "@langchain/langgraph";
import { type ToolNode, createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";

import * as dotenv from "dotenv";

dotenv.config();

const { OPENAI_API_KEY } = process.env;

/**
 * OpenAIのLLMを使ってAI Agent用のインスタンスを作成するメソッド
 */
export const createOpenAIAIAgent = (
  agentTools: ToolNode,
  systemPrompt: string,
) => {
  // Initialize memory to persist state between graph runs
  const agentCheckpointer = new MemorySaver();
  const agentModel = new ChatOpenAI({
    apiKey: OPENAI_API_KEY,
    temperature: 0,
  });

  // AI Agent用のインスタンスをs
  const agent = createReactAgent({
    llm: agentModel,
    tools: agentTools,
    checkpointSaver: agentCheckpointer,
    stateModifier: systemPrompt,
  });

  return agent;
};

/**
 * Call the AI method using OpenAI Agent.
 */
export const runOpenAIAIAgent = async (
  tools: ToolNode,
  systemPrompt: string,
  prompt: string,
) => {
  // Create an instance for the AI agent.
  const agent = createOpenAIAIAgent(tools, systemPrompt);

  // Try executing the AI inference.
  const agentNextState = await agent.invoke(
    { messages: [new HumanMessage(prompt)] },
    { configurable: { thread_id: "44" } },
  );

  const response =
    agentNextState.messages[agentNextState.messages.length - 1].content;

  console.log(response);

  return response;
};
