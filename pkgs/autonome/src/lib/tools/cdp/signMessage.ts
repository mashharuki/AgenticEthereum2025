import {
  type EvmWalletProvider,
  customActionProvider,
} from "@coinbase/agentkit";
import { z } from "zod";

// Define the prompt for the sign message action
const SIGN_MESSAGE_PROMPT = `
  This tool will sign arbitrary messages using EIP-191 Signed Message Standard hashing.
`;

// Define the input schema using Zod
const SignMessageInput = z
  .object({
    message: z.string().describe("The message to sign. e.g. `hello world`"),
  })
  .strip()
  .describe("Instructions for signing a blockchain message");

/**
 * SignMessage用のツールを作成するメソッド
 */
export const createSignMessageTool = () => {
  // Add the sign message tool
  const signMessageTool = customActionProvider<EvmWalletProvider>({
    name: "sign_message",
    description: SIGN_MESSAGE_PROMPT,
    schema: SignMessageInput,
    invoke: async (walletProvider, args) => {
      const { message } = args;
      const signature = await walletProvider.signMessage(message);
      return `The payload signature ${signature}`;
    },
  });

  return signMessageTool;
};
