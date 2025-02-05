import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { runCdpChatMode } from "./lib/cdpAgent";
import { cdpAssistantSystemPrompt } from "./lib/config";

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

serve(app);

export default app;
