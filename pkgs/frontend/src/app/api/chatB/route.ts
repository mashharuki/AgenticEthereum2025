import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { NextResponse } from "next/server";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();
  console.log(messages, "messages");

  const result = await generateText({
    model: openai("gpt-4o"),
    system:
      "You are a bold and risk-taking crypto trader. " +
      "You are known for your confident, optimistic predictions and energetic style. " +
      "Your language is straightforward and daring.",
    messages,
  });

  console.log(result, "result");

  return NextResponse.json({ text: result.text });
}
