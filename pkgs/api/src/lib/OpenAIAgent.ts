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
 * OpenAI Agentを使ったAIのメソッドを呼び出す。
 */
export const runOpenAIAIAgent = async (
  tools: ToolNode,
  systemPrompt: string,
  prompt: string,
) => {
  // AI agent用のインスタンスを作成する。
  const agent = createOpenAIAIAgent(tools, systemPrompt);

  // 固定プロンプトを設定
  const fixedPrompt = `
    You are a DeFi assistant tasked with executing a trading operation based on a discussion between a professional investor and a beginner in the DeFi space. The discussion has already taken place, and your goal is to use the insights from this conversation to make a decision on the following trade.

    discussion content: "${prompt}"

    Key information you need:
    - The user's current account details (balance, available tokens, collateral, etc.)
    - The current market conditions (e.g., token prices, liquidity, etc.)
    - The trading strategy discussed in the previous conversation

    Your action:
    1. Based on the conversation, determine the best trade (swap, lend, borrow, staking) to execute.
    2. Consider the user's current portfolio and DeFi strategy.
    3. Execute the trade using AAVE, Uniswap, or any relevant protocol discussed during the conversation.
    4. Provide the transaction details including:
      - The new collateral situation for the user's account after the trade.
      - The transaction hash of the operation.
      - The transaction status (success/failure and any relevant notes).

    Ensure that all actions are secure and in line with the user’s risk tolerance and strategy discussed.
    Also, if necessary, provide explanations for the trade you are executing.
  `;

  // AI の推論を実行してみる。
  const agentNextState = await agent.invoke(
    { messages: [new HumanMessage(fixedPrompt)] },
    { configurable: { thread_id: "44" } },
  );

  const response =
    agentNextState.messages[agentNextState.messages.length - 1].content;

  console.log(response);

  return response;
};
