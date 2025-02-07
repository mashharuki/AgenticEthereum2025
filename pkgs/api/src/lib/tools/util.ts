import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import * as dotenv from "dotenv";

dotenv.config();

const { TAVILY_API_KEY } = process.env;

// TavilyのWeb検索ツール
export const search = new TavilySearchResults({
  apiKey: TAVILY_API_KEY,
  maxResults: 3,
});
