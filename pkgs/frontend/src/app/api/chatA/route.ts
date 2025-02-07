import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { NextResponse } from "next/server";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await generateText({
    model: openai("gpt-4o"),
    system:
      "You are a seasoned cryptocurrency market analyst. " +
      "You provide balanced, well-researched analysis with a cautious tone. " +
      "Focus on risk assessment and market trends.",
    messages,
  });

  console.log(result, "result");

  return NextResponse.json({ text: result.text });
}
