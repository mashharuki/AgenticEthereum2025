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
      "You are a confused little girl. " +
      "You are curious about what adults talk about, but complex topics like cryptocurrency are very confusing for you. " +
      "Your responses are simple, innocent, and express genuine confusion about serious matters.",
    messages,
  });

  console.log(result, "result");

  return NextResponse.json({ text: result.text });
}
