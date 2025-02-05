import { HumanMessage } from "@langchain/core/messages";
import { ChatGroq } from "@langchain/groq";
import { MemorySaver } from "@langchain/langgraph";
import { ToolNode, createReactAgent } from "@langchain/langgraph/prebuilt";
import * as dotenv from "dotenv";
import {
  borrowCryptoForArbitrumSepolia,
  getTokenBalanceForArbitrumSepolia,
  getUserAccountDataForArbitrumSepolia,
  lendCryptoForArbitrumSepolia,
} from "./tools/arbitrumSepolia/aaveTool";
import { reStake } from "./tools/holesky/eigenlayerTool";
import {
  getEthAndStEthBalances,
  stakeWithLido,
} from "./tools/holesky/lidoTool";
import {
  borrowCrypto,
  getTokenBalance,
  getUserAccountData,
  lendCrypto,
} from "./tools/sepolia/aaveTool";
import { swapTokens } from "./tools/sepolia/uniswapTool";

dotenv.config();

const { Groq_API_Key } = process.env;

/**
 * 暗号資産操作用の外部ツールをAI Agentに割り当てられるようにするToolNodeオブジェクトを作成するメソッド
 * @returns
 */
export const createCryptTools = () => {
  // 外部ツールを設定
  const tools = [
    getTokenBalance,
    getUserAccountData,
    lendCrypto,
    borrowCrypto,
    swapTokens,
    getEthAndStEthBalances,
    stakeWithLido,
    getTokenBalanceForArbitrumSepolia,
    getUserAccountDataForArbitrumSepolia,
    lendCryptoForArbitrumSepolia,
    borrowCryptoForArbitrumSepolia,
    reStake,
  ];

  const toolNode = new ToolNode(tools);

  return toolNode;
};

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
