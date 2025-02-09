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
import { holesky } from "viem/chains";
import { z } from "zod";
import {
  createPrivyViemAccount,
  createPrivyWallet,
} from "../../../wallet/privy";
import { ERC20_ABI } from "../abis/erc20_abi";

dotenv.config();

const { ALCHEMY_API_KEY } = process.env;

// Lido contract information
const LIDO_ABI = [
  {
    constant: false,
    inputs: [{ name: "_referral", type: "address" }],
    name: "submit",
    outputs: [{ name: "", type: "uint256" }],
    payable: true,
    stateMutability: "payable",
    type: "function",
  },
];

// Lido contract address(Holesky)
const LIDO_ADDRESS = "0x3F1c547b21f65e10480dE3ad8E19fAAC46C95034";

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
 * ETH の残高を取得するメソッド
 * @param walletAddress
 * @returns
 */
async function getETHBalance(walletAddress: `0x${string}`) {
  const balance = await publicClient.getBalance({ address: walletAddress });
  console.log(`ETH Balance: ${balance}`);
  return formatUnits(balance, 18);
}

/**
 * stETHの残高を取得するメソッド
 * @param walletAddress
 * @param tokenAddress
 * @returns
 */
async function getERC20Balance(
  walletAddress: `0x${string}`,
  tokenAddress: `0x${string}`,
) {
  const balance = await publicClient.readContract({
    abi: ERC20_ABI,
    address: tokenAddress,
    functionName: "balanceOf",
    args: [walletAddress],
  });
  console.log(`ERC20 Balance: ${balance}`);
  return formatUnits(balance as bigint, 18);
}

/**
 * Stake cryptocurrency using Lido Contract
 */
const stakeWithLido = tool(
  async (input: { referralAddress: `0x${string}`; amount: number }) => {
    try {
      const { referralAddress, amount } = input;
      // Parse the amount to Wei
      const amountInWei = parseUnits(amount.toString(), 18);

      console.log(`Staking ${amount} ETH (${amountInWei} Wei) with Lido...`);

      // Execute the transaction
      const txHash = await walletClient.writeContract({
        account: await createPrivyViemAccount(),
        abi: LIDO_ABI,
        address: LIDO_ADDRESS,
        functionName: "submit",
        args: [referralAddress],
        value: amountInWei,
      });

      console.log(`Transaction sent: ${txHash}`);

      // トランザクション完了待ち
      await publicClient.waitForTransactionReceipt({ hash: txHash });

      return txHash;
    } catch (error) {
      console.error("Error in stakeWithLido:", error);
      return null;
    }
  },
  {
    name: "stake_with_lido",
    description: "Stake a specified amount of cryptocurrency with Lido.",
    schema: z.object({
      amount: z
        .number()
        .positive()
        .describe("The amount of cryptocurrency to stake."),
      referralAddress: z
        .string()
        .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address")
        .transform((val) => val as `0x${string}`)
        .describe("The referral address for Lido staking."),
    }),
  },
);

/**
 * Get the balances of ETH and stETH for the connected wallet.
 */
const getEthAndStEthBalances = tool(
  async () => {
    try {
      // privyのWalletインスタンスを作成
      const walletData = await createPrivyWallet();
      // walletDataからWalletのアドレスを取得
      const walletAddress = walletData.address;

      console.log(`Getting balances for wallet: ${walletAddress}`);

      // ETH balance
      const ethBalance = await getETHBalance(walletAddress as `0x${string}`);

      // stETH balance
      const stETHBalance = await getERC20Balance(
        walletAddress as `0x${string}`,
        LIDO_ADDRESS,
      );

      return {
        ethBalance,
        stETHBalance,
      };
    } catch (error) {
      console.error("Error in getBalancesTool:", error);
      return null;
    }
  },
  {
    name: "get_balances",
    description: "Get the balances of ETH and stETH for the connected wallet.",
  },
);

export { getEthAndStEthBalances, stakeWithLido };
