import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { runOpenAIAIAgent } from "./lib/agent/OpenAIAgent";
import {
  analysisAndStrategySpecialistSystemPrompt,
  defiAssistantSystemPrompt,
  newsAndFundamentalInformationSpecialistSystemPrompt,
  performanceMonitoringSpecialistSystemPrompt,
  riskManagementSpecialistSystemPrompt,
  socialTrendSpecialistSystemPrompt,
} from "./lib/agent/config";
import { runChatGroqAgent } from "./lib/agent/grogAgent";
import {
  createDeFiTools,
  createReserchTools,
  createanalysisTools,
} from "./lib/agent/tools/util";
import { runVertexAIAIAgent } from "./lib/agent/vertexAgent";

// create a new Hono instance
const app = new Hono();

/**
 * The system prompt and tools will change based on the operation flag of the argument function.
 */
const setUpSystemPromptAndTools = (operation: string) => {
  switch (operation) {
    case "DeFi":
      return {
        systemPrompt: defiAssistantSystemPrompt,
        tools: createDeFiTools(),
      };
    case "SocialTrend":
      return {
        systemPrompt: socialTrendSpecialistSystemPrompt,
        tools: createReserchTools(),
      };
    case "NewsAndFundamentals":
      return {
        systemPrompt: newsAndFundamentalInformationSpecialistSystemPrompt,
        tools: createReserchTools(),
      };
    case "RiskManagement":
      return {
        systemPrompt: riskManagementSpecialistSystemPrompt,
        tools: createanalysisTools(),
      };
    case "PerformanceMonitoring":
      return {
        systemPrompt: performanceMonitoringSpecialistSystemPrompt,
        tools: createanalysisTools(),
      };
    case "AnalysisAndReasoning":
      return {
        systemPrompt: analysisAndStrategySpecialistSystemPrompt,
        tools: createanalysisTools(),
      };
    default:
      return {
        systemPrompt: defiAssistantSystemPrompt,
        tools: createDeFiTools(),
      };
  }
};

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
  const { prompt, operation } = await c.req.json();

  if (!prompt) {
    return c.json(
      {
        error: "Prompt is required",
      },
      400,
    );
  }

  // The system prompt and tools will change based on the operation flag of the argument.
  const { systemPrompt, tools } = setUpSystemPromptAndTools(operation);
  // call runVertexAIAIAgent function
  const response = await runVertexAIAIAgent(tools, systemPrompt, prompt);

  return c.json({
    result: response,
  });
});

/**
 * call ChatGrogAgent function
 */
app.post("/runChatGroqAgent", async (c) => {
  // get prompt from request body
  const { prompt, operation } = await c.req.json();

  if (!prompt) {
    return c.json(
      {
        error: "Prompt is required",
      },
      400,
    );
  }

  // The system prompt and tools will change based on the operation flag of the argument.
  const { systemPrompt, tools } = setUpSystemPromptAndTools(operation);
  // call runChatGroqAgent function
  const response = await runChatGroqAgent(tools, systemPrompt, prompt);

  return c.json({
    result: response,
  });
});

/**
 * call OpenAIAIAgent function
 */
app.post("/runCryptOpenAIAgent", async (c) => {
  // get prompt from request body
  const { prompt, operation } = await c.req.json();

  if (!prompt) {
    return c.json(
      {
        error: "Prompt is required",
      },
      400,
    );
  }

  // The system prompt and tools will change based on the operation flag of the argument.
  const { systemPrompt, tools } = setUpSystemPromptAndTools(operation);
  // runOpenAIAIAgent メソッドを呼び出す。
  const response = await runOpenAIAIAgent(tools, systemPrompt, prompt);

  return c.json({
    result: response,
  });
});

serve(app);

export default app;
