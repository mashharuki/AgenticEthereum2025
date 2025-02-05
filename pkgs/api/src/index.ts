import { serve } from "@hono/node-server";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { runOpenAIAIAgent } from "./lib/OpenAIAgent";
import { runCdpChatMode } from "./lib/cdpAgent";
import {
  cdpAssistantSystemPrompt,
  defiAssistantSystemPrompt,
  defiBeginnerSystemPrompt,
  defiProSystemPrompt,
} from "./lib/config";
import { createCryptTools, runChatGroqAgent } from "./lib/grogAgent";
import { getTrendingTokens } from "./lib/tools/coinGeckoTool";
import { search } from "./lib/tools/util";
import { runVertexAIAIAgent } from "./lib/vertexAgent";

const app = new Hono();

// CORSの設定
app.use(
  "*", // 全てのエンドポイントに適用
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "DELETE"],
    allowHeaders: ["Content-Type", "Authorization"],
  }),
);

/**
 * デフォルトのメソッド
 */
app.get("/", (c) => {
  return c.text("Hello, World!");
});

/**
 * ヘルスチェックメソッド
 */
app.get("/health", (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

/**
 * Vertex AI のLLMを使ったAIAgentのサンプルメソッドを呼び出す
 */
app.post("/agentVertexAI", async (c) => {
  // リクエストボディからプロンプトを取得
  const { prompt } = await c.req.json();

  // プロンプトが存在しない場合にエラーハンドリング
  if (!prompt) {
    return c.json(
      {
        error: "Prompt is required",
      },
      400,
    );
  }

  // runVertexAIAIAgentメソッドを呼び出す。
  const response = await runVertexAIAIAgent(
    createCryptTools(),
    defiAssistantSystemPrompt,
    prompt,
  );

  return c.json({
    result: response,
  });
});

/**
 * CDP AgentKitを使ったAIのメソッドを呼び出すメソッド
 */
app.post("/runCdpChatMode", async (c) => {
  // リクエストボディからプロンプトを取得
  const { prompt } = await c.req.json();

  // プロンプトが存在しない場合にエラーハンドリング
  if (!prompt) {
    return c.json(
      {
        error: "Prompt is required",
      },
      400,
    );
  }

  const response = await runCdpChatMode(cdpAssistantSystemPrompt, prompt);

  return c.json({
    result: response,
  });
});

/**
 * Chat Groq Agentを使ったAIのメソッドを呼び出す。
 * ツールの設定は、lib/chatGrog.tsに記述されている。
 */
app.post("/runChatGroqAgent", async (c) => {
  // リクエストボディからプロンプトを取得
  const { prompt } = await c.req.json();

  // プロンプトが存在しない場合にエラーハンドリング
  if (!prompt) {
    return c.json(
      {
        error: "Prompt is required",
      },
      400,
    );
  }

  // runChatGroqAgentメソッドを呼び出す。
  const response = await runChatGroqAgent(
    createCryptTools(),
    defiAssistantSystemPrompt,
    prompt,
  );

  return c.json({
    result: response,
  });
});

/**
 * OpenAI のLLMを使ったAIAgentのサンプルメソッドを呼び出す
 */
app.post("/runCryptOpenAIAgent", async (c) => {
  // リクエストボディからプロンプトを取得
  const { prompt } = await c.req.json();

  // プロンプトが存在しない場合にエラーハンドリング
  if (!prompt) {
    return c.json(
      {
        error: "Prompt is required",
      },
      400,
    );
  }

  // runOpenAIAIAgent メソッドを呼び出す。
  const response = await runOpenAIAIAgent(
    createCryptTools(),
    defiAssistantSystemPrompt,
    prompt,
  );

  return c.json({
    result: response,
  });
});

/**
 * マルチAI Agentでライブディスカッションさせるメソッド
 */
app.post("/discussion", async (c) => {
  // リクエストボディからプロンプトを取得
  const { prompt } = await c.req.json();

  // プロンプトが存在しない場合にエラーハンドリング
  if (!prompt) {
    return c.json(
      {
        error: "Prompt is required",
      },
      400,
    );
  }

  // groqAgentに渡すツールを設定
  const proTool = [search, getTrendingTokens];
  const proTools = new ToolNode(proTool);

  // runChatGroqAgent(ここではDeFiに詳しいプロの投資家)メソッドを呼び出す。
  const groqResponse = await runChatGroqAgent(
    proTools,
    defiProSystemPrompt,
    prompt,
  );

  // VertexAIに渡すツールを設定
  const biggnerTool = [search];
  const biggnerTools = new ToolNode(biggnerTool);

  // runVertexAIAIAgent(ここではDeFi初心者)メソッドを呼び出す。
  const vertexResponse = await runVertexAIAIAgent(
    biggnerTools,
    defiBeginnerSystemPrompt,
    groqResponse.toString(),
  );

  // もう一回プロの投資家AI Agentの機能を呼び出す。
  // 初心者の質問に対して、プロの投資家が回答する。
  const groqResponse2 = await runChatGroqAgent(
    proTools,
    defiProSystemPrompt,
    `
      Below are questions from a DeFi beginner who is eager to understand complex concepts.
      Please provide clear, simple, and beginner-friendly answers, breaking down technical terms where necessary.
      Aim to educate and build confidence in their learning journey.

      Here are the questions:
      ${vertexResponse}

      Please explain your answers in a way that a beginner would understand, using examples when possible.
      If additional context or resources would be helpful, please mention them as well.
    `,
  );

  // runOpenAIAIAgent メソッドを呼び出す。
  const openAIresponse = await runOpenAIAIAgent(
    createCryptTools(),
    defiAssistantSystemPrompt,
    groqResponse2.toString(),
  );

  return c.json({
    groqResult: groqResponse,
    vertexResult: vertexResponse,
    groqResponse2: groqResponse2,
    OpenAIResult: openAIresponse,
  });
});

serve(app);

export default app;
