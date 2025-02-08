import { tool } from "@langchain/core/tools";
import * as dotenv from "dotenv";
import "dotenv/config";
import { http, createPublicClient, createWalletClient, parseUnits } from "viem";
import { holesky } from "viem/chains";
import { z } from "zod";
import { createPrivyViemAccount } from "../../wallet/privy";
import { ERC20_ABI } from "../abis/erc20_abi";

dotenv.config();

const { ALCHEMY_API_KEY } = process.env;

// EIGENLAYER contract information
const EIGENLAYER_ABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "strategy",
        type: "address",
      },
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "depositIntoStrategy",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

// EigenLayer contract address(Holesky)
const EIGENLAYER_ADDRESS = "0xdfB5f6CE42aAA7830E94ECFCcAd411beF4d4D5b6";

// Set up clients
const publicClient = createPublicClient({
  chain: holesky,
  transport: http(`https://eth-holesky.g.alchemy.com/v2/${ALCHEMY_API_KEY}`),
});

// Create a wallet client
const walletClient = createWalletClient({
  chain: holesky,
  transport: http(`https://eth-holesky.g.alchemy.com/v2/${ALCHEMY_API_KEY}`),
});

/**
 * reStake cryptocurrency using EigenLayer Contract
 */
const reStake = tool(
  async (input: { assetAddress: `0x${string}`; amount: number }) => {
    try {
      const { assetAddress, amount } = input;
      // トークンのデシマル数を取得
      const decimals = (await publicClient.readContract({
        abi: ERC20_ABI,
        address: assetAddress,
        functionName: "decimals",
      })) as number;

      console.log(`Decimals: ${decimals}`);
      // 単位を変換する。
      const amountInWei = parseUnits(amount.toString(), decimals);
      console.log(`amountInWei: ${amountInWei}`);

      // 承認トランザクションを実行
      const approveHash = await walletClient.writeContract({
        account: await createPrivyViemAccount(),
        abi: ERC20_ABI,
        address: assetAddress,
        functionName: "approve",
        args: [EIGENLAYER_ADDRESS, amountInWei],
      });
      console.log(`Approval transaction hash: ${approveHash}`);

      // 承認の完了を待つ
      await publicClient.waitForTransactionReceipt({ hash: approveHash });

      // Execute the transaction
      const txHash = await walletClient.writeContract({
        account: await createPrivyViemAccount(),
        abi: EIGENLAYER_ABI,
        address: EIGENLAYER_ADDRESS,
        functionName: "depositIntoStrategy",
        args: [
          "0x7D704507b76571a51d9caE8AdDAbBFd0ba0e63d3",
          assetAddress,
          amountInWei,
        ],
      });

      console.log(`ReStaking Transaction sent: ${txHash}`);

      // トランザクション完了待ち
      await publicClient.waitForTransactionReceipt({ hash: txHash });

      return txHash;
    } catch (error) {
      console.error("Error in reStake:", error);
      return null;
    }
  },
  {
    name: "restake",
    description:
      "reStake a specified amount of cryptocurrency using EigenLayer Contract.",
    schema: z.object({
      amount: z
        .number()
        .positive()
        .describe("The amount of cryptocurrency to reStake."),
      assetAddress: z
        .string()
        .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address")
        .transform((val) => val as `0x${string}`)
        .describe("The asset Address for reStaking."),
    }),
  },
);

export { reStake };
