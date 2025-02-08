import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import * as dotenv from "dotenv";
import {
  borrowCryptoForArbitrumSepolia,
  getTokenBalanceForArbitrumSepolia,
  getUserAccountDataForArbitrumSepolia,
  lendCryptoForArbitrumSepolia,
} from "./arbitrumSepolia/aaveTool";
import { getTrendingTokens } from "./coinGeckoTool";
import { reStake } from "./holesky/eigenlayerTool";
import { getEthAndStEthBalances, stakeWithLido } from "./holesky/lidoTool";
import {
  borrowCrypto,
  getTokenBalance,
  getUserAccountData,
  lendCrypto,
} from "./sepolia/aaveTool";
import { swapTokens } from "./sepolia/uniswapTool";

dotenv.config();

const { TAVILY_API_KEY } = process.env;

// Tavily Search Results Tools
export const search = new TavilySearchResults({
  apiKey: TAVILY_API_KEY,
  maxResults: 3,
});

/**
 * Create tools for the Crypto Assistant AI Agent
 * Swap uniswap
 * Lend AAVE
 * Borrow AAVE
 * Check token balance
 * Stake ETH
 * ReStake stETH
 */
export const createDeFiTools = () => {
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
 * getter Token balance tools for the Assistant AI Agent
 * @returns
 */
export const createTokenBalanceTools = () => {
  const tools = [
    getTokenBalance,
    getUserAccountData,
    getEthAndStEthBalances,
    getTokenBalanceForArbitrumSepolia,
    getUserAccountDataForArbitrumSepolia,
  ];

  const toolNode = new ToolNode(tools);
  return toolNode;
};

/**
 * Create research tools for the Assistant AI Agent
 */
export const createReserchTools = () => {
  // get tools
  const tools = [search, getTrendingTokens];

  const toolNode = new ToolNode(tools);
  return toolNode;
};

/**
 * create Analysis and Reasoning tools for the Assistant AI Agent
 */
export const createanalysisTools = () => {
  // get tools
  const tools = [
    search,
    getTrendingTokens,
    getTokenBalance,
    getUserAccountData,
    getEthAndStEthBalances,
    getTokenBalanceForArbitrumSepolia,
    getUserAccountDataForArbitrumSepolia,
  ];

  const toolNode = new ToolNode(tools);
  return toolNode;
};
