import { tool } from "@langchain/core/tools";
import * as dotenv from "dotenv";
import "dotenv/config";
import {
  http,
  createPublicClient,
  createWalletClient,
  formatUnits,
  parseUnits,
} from "viem";
import { sepolia } from "viem/chains";
import { z } from "zod";
import {
  createPrivyViemAccount,
  createPrivyWallet,
} from "../../../wallet/privy";
import { ERC20_ABI } from "../abis/erc20_abi";
import { FACTORY_ABI } from "../abis/uniswap/factory";
import { QUOTER_ABI } from "../abis/uniswap/quoter";
import { SWAP_ROUTER_ABI } from "../abis/uniswap/swaprouter";

dotenv.config();

const { ALCHEMY_API_KEY } = process.env;

// Deployment Addresses
const POOL_FACTORY_CONTRACT_ADDRESS =
  "0x0227628f3F023bb0B980b67D528571c95c6DaC1c";
const QUOTER_CONTRACT_ADDRESS = "0xEd1f6473345F45b75F8179591dd5bA1888cf2FB3";
const SWAP_ROUTER_CONTRACT_ADDRESS =
  "0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E";

// Set up clients
const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(`https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`),
});

const walletClient = createWalletClient({
  chain: sepolia,
  transport: http(`https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`),
});

/**
 * トークンをApproveするメソッド
 */
async function approveToken(tokenAddress: `0x${string}`, amount: bigint) {
  try {
    // call approve tx
    const approveTx = await walletClient.writeContract({
      account: await createPrivyViemAccount(),
      abi: ERC20_ABI,
      address: tokenAddress,
      functionName: "approve",
      args: [SWAP_ROUTER_CONTRACT_ADDRESS, amount],
    });

    console.log("-------------------------------");
    console.log("Sending Approval Transaction...");
    console.log(`Transaction Sent: ${approveTx}`);
    console.log("-------------------------------");

    const receipt = await publicClient.waitForTransactionReceipt({
      hash: approveTx,
    });
    console.log(
      `Approval Transaction Confirmed! https://sepolia.etherscan.io/txn/${receipt.transactionHash}`,
    );
  } catch (error) {
    console.error("An error occurred during token approval:", error);
    throw new Error("Token approval failed");
  }
}

/**
 * Pool情報を取得するメソッド
 */
async function getPoolInfo(tokenIn: `0x${string}`, tokenOut: `0x${string}`) {
  const poolAddress = await publicClient.readContract({
    address: POOL_FACTORY_CONTRACT_ADDRESS,
    abi: FACTORY_ABI,
    functionName: "getPool",
    args: [tokenIn, tokenOut, 3000],
  });
  if (!poolAddress) {
    throw new Error("Failed to get pool address");
  }
  return poolAddress;
}

/**
 * Swapクオートを取得するメソッド
 */
async function quoteAndLogSwap(
  tokenIn: `0x${string}`,
  tokenOut: `0x${string}`,
  amountIn: bigint,
  decimals: number,
) {
  // walllet data
  const walletData = await createPrivyWallet();

  const quotedAmountOut = await publicClient.readContract({
    address: QUOTER_CONTRACT_ADDRESS,
    abi: QUOTER_ABI,
    functionName: "quoteExactInputSingle",
    args: [
      {
        tokenIn: tokenIn,
        tokenOut: tokenOut,
        fee: 3000,
        recipient: walletData.address,
        deadline: Math.floor(new Date().getTime() / 1000 + 60 * 10),
        amountIn: amountIn,
        sqrtPriceLimitX96: 0,
      },
    ],
  });
  console.log("-------------------------------");
  // Clean up output if necessary
  return formatUnits(quotedAmountOut[0].toString(), decimals);
}

/**
 * Swapを実行するメソッド
 */
async function executeSwap(
  tokenIn: `0x${string}`,
  tokenOut: `0x${string}`,
  amountIn: bigint,
  amountOutMinimum: bigint,
) {
  // walllet data
  const walletData = await createPrivyWallet();
  // call swap function
  const swapTx = await walletClient.writeContract({
    account: await createPrivyViemAccount(),
    address: SWAP_ROUTER_CONTRACT_ADDRESS,
    abi: SWAP_ROUTER_ABI,
    functionName: "exactInputSingle",
    args: [
      {
        tokenIn: tokenIn,
        tokenOut: tokenOut,
        fee: 3000,
        recipient: walletData.address,
        amountIn: amountIn,
        amountOutMinimum: amountOutMinimum,
        sqrtPriceLimitX96: 0,
      },
    ],
  });
  console.log("-------------------------------");
  console.log(`Swap Transaction Sent: ${swapTx}`);
  console.log("-------------------------------");
  const receipt = await publicClient.waitForTransactionReceipt({
    hash: swapTx,
  });
  console.log(
    `Swap Transaction Confirmed! https://sepolia.etherscan.io/tx/${receipt.transactionHash}`,
  );

  return receipt.transactionHash;
}

/**
 * 暗号通貨をswapするツール
 * @param fromTokenAddress
 * @param toTokenAddress
 * @param amount
 * @returns
 */
const swapTokens = tool(
  async (input: {
    fromTokenAddress: `0x${string}`;
    toTokenAddress: `0x${string}`;
    amount: number;
  }) => {
    try {
      const { fromTokenAddress, toTokenAddress, amount } = input;

      // 変換元のトークンのDecimalsを取得する
      const fromTokenDecimals = (await publicClient.readContract({
        abi: ERC20_ABI,
        address: fromTokenAddress,
        functionName: "decimals",
      })) as number;

      // 変換先のトークンのDecimalsを取得する
      const toTokenDecimals = (await publicClient.readContract({
        abi: ERC20_ABI,
        address: toTokenAddress,
        functionName: "decimals",
      })) as number;

      console.log(`fromTokenDecimals: ${fromTokenDecimals}`);
      console.log(`toTokenDecimals: ${toTokenDecimals}`);
      // 単位を変換する。
      const amountInWei = parseUnits(amount.toString(), fromTokenDecimals);
      console.log(`amountInWei: ${amountInWei}`);

      // トークンをApproveする
      await approveToken(fromTokenAddress, amountInWei);
      // Pool情報を取得する
      const poolAddress = await getPoolInfo(fromTokenAddress, toTokenAddress);
      console.log(`Pool Address: ${poolAddress}`);
      // Swapクオートを取得する
      const quotedAmountOut = await quoteAndLogSwap(
        fromTokenAddress,
        toTokenAddress,
        amountInWei,
        toTokenDecimals,
      );
      // 小数から整数に変換
      const minAmountOutBigInt = BigInt(
        Math.floor(Number(quotedAmountOut) * 10 ** toTokenDecimals),
      );
      // swapを実行する。
      const txHash = await executeSwap(
        fromTokenAddress,
        toTokenAddress,
        amountInWei,
        minAmountOutBigInt,
      );

      return txHash;
    } catch (error) {
      console.error("Error in SwapTokensTool:", error);
      return null;
    }
  },
  {
    name: "swap_tokens",
    description:
      "Swap a specified amount of one cryptocurrency token for another.",
    schema: z.object({
      amount: z
        .number()
        .positive()
        .describe("The amount of cryptocurrency to swap."),
      fromTokenAddress: z
        .string()
        .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address")
        .transform((val) => val as `0x${string}`)
        .describe("The address of the token to swap from."),
      toTokenAddress: z
        .string()
        .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address")
        .transform((val) => val as `0x${string}`)
        .describe("The address of the token to swap to."),
    }),
  },
);

export { swapTokens };
