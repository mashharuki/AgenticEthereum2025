import * as fs from "node:fs";
import {
  AgentKit,
  CdpWalletProvider,
  cdpApiActionProvider,
  cdpWalletActionProvider,
  erc20ActionProvider,
  pythActionProvider,
  walletActionProvider,
  wethActionProvider,
} from "@coinbase/agentkit";
import { getLangChainTools } from "@coinbase/agentkit-langchain";
import { HumanMessage } from "@langchain/core/messages";
import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import * as dotenv from "dotenv";
import {
  createBorrowCryptoToolForCdp,
  createGetTokenBalanceToolForCdp,
  createGetUserAccountDataToolForCdp,
  createLendCryptoToolForCdp,
} from "./tools/cdp/cdpAaveTool";
import { createSignMessageTool } from "./tools/cdp/signMessage";

dotenv.config();

const {
  OPENAI_API_KEY,
  NETWORK_ID,
  CDP_API_KEY_NAME,
  CDP_API_KEY_PRIVATE_KEY,
} = process.env;

// Configure a file to persist the agent's CDP MPC Wallet Data
const WALLET_DATA_FILE = "wallet_data.txt";

/**
 * get tools for Coinbase Developer Platform AgentKit
 */
export const createCdpAgentKitTools = async () => {
  let walletDataStr: string | null = null;

  // Read existing wallet data if available
  if (fs.existsSync(WALLET_DATA_FILE)) {
    try {
      walletDataStr = fs.readFileSync(WALLET_DATA_FILE, "utf8");
      // console.log("Read wallet data:", walletDataStr);
    } catch (error) {
      console.error("Error reading wallet data:", error);
      // Continue without wallet data
    }
  }

  // Configure CDP AgentKit
  const config = {
    apiKeyName: CDP_API_KEY_NAME,
    apiKeyPrivateKey: CDP_API_KEY_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    cdpWalletData: walletDataStr || undefined,
    networkId: NETWORK_ID || "base-sepolia",
  };

  // Initialize CDP Wallet Provider
  const walletProvider = await CdpWalletProvider.configureWithWallet(config);

  console.log("Wallet Provider initialized");

  // Initialize AgentKit
  const agentkit = await AgentKit.from({
    walletProvider,
    actionProviders: [
      wethActionProvider(),
      pythActionProvider(),
      walletActionProvider(),
      erc20ActionProvider(),
      cdpApiActionProvider({
        apiKeyName: CDP_API_KEY_NAME,
        apiKeyPrivateKey: CDP_API_KEY_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
      cdpWalletActionProvider({
        apiKeyName: CDP_API_KEY_NAME,
        apiKeyPrivateKey: CDP_API_KEY_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
      createSignMessageTool(),
      createGetTokenBalanceToolForCdp,
      createGetUserAccountDataToolForCdp,
      createBorrowCryptoToolForCdp,
      createLendCryptoToolForCdp,
    ],
  });

  // 外部ツールを取得
  const cdpAgentKitTools = await getLangChainTools(agentkit);

  return { agentkit, cdpAgentKitTools, walletProvider };
};

/**
 * Initialize the agent with CDP AgentKit method
 * @returns Agent executor and config
 */
export const initializeCdpAgent = async (systemPrompt: string) => {
  // Initialize LLM
  const llm = new ChatOpenAI({
    model: "gpt-3.5-turbo",
    apiKey: OPENAI_API_KEY,
    // apiKey: "gaia",
    /*
    configuration: {
      baseURL: "https://llamatool.us.gaianet.network/v1",
    },
    */
  });

  // create CDP AgentKit tools
  const { agentkit, cdpAgentKitTools, walletProvider } =
    await createCdpAgentKitTools();

  // Store buffered conversation history in memory
  const memory = new MemorySaver();
  const agentConfig = {
    configurable: { thread_id: "CDP AgentKit Chatbot Example!" },
  };

  // Create React Agent using the LLM and CDP AgentKit tools
  const agent = createReactAgent({
    llm,
    tools: cdpAgentKitTools,
    checkpointSaver: memory,
    stateModifier: systemPrompt,
  });

  // Save wallet data
  const exportedWallet = await walletProvider.exportWallet();
  fs.writeFileSync(WALLET_DATA_FILE, JSON.stringify(exportedWallet));

  return { agent, config: agentConfig };
};

/**
 * Run the agent interactively based on user input
 *
 * @param agent - The agent executor
 * @param config - Agent configuration
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const runCdpChatMode = async (systemPrompt: string, prompt: string) => {
  console.log("Starting ... ");

  const response: string[] = [];

  try {
    // get agent and config
    const { agent, config } = await initializeCdpAgent(systemPrompt);

    // call AI API
    const stream = await agent.invoke(
      { messages: [new HumanMessage(prompt)] },
      config,
    );

    console.log(
      "Stream output:",
      stream.messages[stream.messages.length - 1].content.toString(),
    );

    response.push(
      "====================================================================",
    );
    response.push(
      stream.messages[stream.messages.length - 1].content.toString(),
    );
    response.push(
      "====================================================================",
    );

    return response;
  } catch (error) {
    console.error("Error running chat mode:", error);
    return response;
  }
};
