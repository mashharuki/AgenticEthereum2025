import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import * as dotenv from "dotenv";
import { privateKeyToAccount } from "viem/accounts";

dotenv.config();

const { PRIVATE_KEY, TAVILY_API_KEY } = process.env;

// 秘密鍵からアカウントを作成
export const account = privateKeyToAccount(PRIVATE_KEY as `0x${string}`);

// TavilyのWeb検索ツール
export const search = new TavilySearchResults({
  apiKey: TAVILY_API_KEY,
  maxResults: 3,
});
