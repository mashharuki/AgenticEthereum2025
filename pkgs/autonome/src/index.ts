import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { runCdpChatMode } from "./lib/cdpAgent";
import { cdpAssistantSystemPrompt } from "./lib/config";

const app = new Hono();

// CORS Setting
app.use(
  "*", // Applies to all endpoints.
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "DELETE"],
    allowHeaders: ["Content-Type", "Authorization"],
  }),
);

/**
 * default method
 */
app.get("/", (c) => {
  return c.text("Hello, World!");
});

/**
 * health check method
 */
app.get("/health", (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

/**
 * CDP AgentKit Chat Mode method
 */
app.post("/runCdpChatMode", async (c) => {
  // Get a prompt from a request body.
  const { prompt } = await c.req.json();

  // Error handling when no prompt exists
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
