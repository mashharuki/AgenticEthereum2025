import { type BaseChatModel, ChatAnthropic } from "@langchain/anthropic";
import type { BaseChatModelCallOptions } from "@langchain/core/language_models/chat_models";
import { type AIMessageChunk, HumanMessage } from "@langchain/core/messages";
import { MemorySaver } from "@langchain/langgraph";
import { type ToolNode, createReactAgent } from "@langchain/langgraph/prebuilt";

import * as dotenv from "dotenv";

dotenv.config();

const { ANTHROPIC_KEY_API } = process.env;

/**
 * Method for creating an instance for an AI Agent using Anthropic's LLM
 */
export const createAnthropicAIAgent = (
  agentTools: ToolNode,
  systemPrompt: string,
) => {
  // Initialize memory to persist state between graph runs
  const agentCheckpointer = new MemorySaver();
  // create a new instance of the ChatAnthropic model
  const agentModel: BaseChatModel<BaseChatModelCallOptions, AIMessageChunk> =
    new ChatAnthropic({
      model: "claude-3-5-sonnet-latest",
      apiKey: ANTHROPIC_KEY_API,
    });

  // Generate an instance for AI Agent
  const agent = createReactAgent({
    llm: agentModel,
    tools: agentTools,
    checkpointSaver: agentCheckpointer,
    stateModifier: systemPrompt,
  });

  return agent;
};

/**
 * Call the AI method using Anthropic Agent
 */
export const runAnthropicAIAgent = async (
  tools: ToolNode,
  systemPrompt: string,
  prompt: string,
) => {
  // Create an instance for the AI agent
  const agent = createAnthropicAIAgent(tools, systemPrompt);

  // Let's try running an AI inference
  const agentNextState = await agent.invoke(
    { messages: [new HumanMessage(prompt)] },
    { configurable: { thread_id: "44" } },
  );

  const response =
    agentNextState.messages[agentNextState.messages.length - 1].content;

  console.log(response);

  return response;
};
