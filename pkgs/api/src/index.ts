import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { runOpenAIAIAgent } from "./lib/agent/OpenAIAgent";
import { defiAssistantSystemPrompt } from "./lib/agent/config";
import { runChatGroqAgent } from "./lib/agent/grogAgent";
import { createDeFiTools, createReserchTools } from "./lib/agent/tools/util";
import { runVertexAIAIAgent } from "./lib/agent/vertexAgent";

const app = new Hono();

// CORS configuration
app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "DELETE"],
    allowHeaders: ["Content-Type", "Authorization"],
  }),
);

app.get("/", (c) => {
  return c.text("Hello, World!");
});

/**
 * Health Check API
 */
app.get("/health", (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

/**
 * Call Vertex AI Agent function
 */
app.post("/agentVertexAI", async (c) => {
  // get prompt from request body
  const { prompt } = await c.req.json();

  if (!prompt) {
    return c.json(
      {
        error: "Prompt is required",
      },
      400,
    );
  }

  // call runVertexAIAIAgent function
  const response = await runVertexAIAIAgent(
    createReserchTools(),
    defiAssistantSystemPrompt,
    prompt,
  );

  return c.json({
    result: response,
  });
});

/**
 * call ChatGrogAgent function
 */
app.post("/runChatGroqAgent", async (c) => {
  // get prompt from request body
  const { prompt } = await c.req.json();

  if (!prompt) {
    return c.json(
      {
        error: "Prompt is required",
      },
      400,
    );
  }

  // call runChatGroqAgent function
  const response = await runChatGroqAgent(
    createReserchTools(),
    defiAssistantSystemPrompt,
    prompt,
  );

  return c.json({
    result: response,
  });
});

/**
 * call OpenAIAIAgent function
 */
app.post("/runCryptOpenAIAgent", async (c) => {
  // get prompt from request body
  const { prompt } = await c.req.json();

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
    createDeFiTools(),
    defiAssistantSystemPrompt,
    prompt,
  );

  return c.json({
    result: response,
  });
});

serve(app);

export default app;
