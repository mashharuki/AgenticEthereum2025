import { tool } from "@langchain/core/tools";
import * as dotenv from "dotenv";
import { http, createPublicClient, createWalletClient, parseUnits } from "viem";
import { sepolia } from "viem/chains";
import { z } from "zod";
import {
  createPrivyViemAccount,
  createPrivyWallet,
} from "../../../wallet/privy";
import { AAVE_LENDING_POOL_ABI_TESTNET } from "../abis/aave_lending_pool_abi_testnet";
import { ERC20_ABI } from "../abis/erc20_abi";

dotenv.config();

const { ALCHEMY_API_KEY } = process.env;

// Contract address
const AAVE_LENDING_POOL_ADDRESS = "0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951";

// Create a public Client and a wallet Client
const client = createPublicClient({
  chain: sepolia,
  transport: http(`https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`),
});
const walletClient = createWalletClient({
  transport: http(`https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`),
  chain: sepolia,
});

/**
 * Borrow cryptocurrency.
 * @param amount Amount of cryptocurrency to borrow
 * @param assetAddress Contract address of the asset to be borrowed
 * @param interestRateMode Interest rate mode (1: fixed interest rate, 2: variable interest rate)
 * @returns Transaction hash or null
 */
const borrowCrypto = tool(
  async (input: {
    amount: number;
    assetAddress: `0x${string}`;
  }) => {
    try {
      const interestRateMode = 2;
      const { amount, assetAddress } = input;

      // Get the token decimals.
      const decimals = (await client.readContract({
        abi: ERC20_ABI,
        address: assetAddress,
        functionName: "decimals",
      })) as number;

      console.log(`Decimals: ${decimals}`);

      // Convert the amount borrowed into tokens
      const amountInWei = parseUnits(amount.toString(), decimals);

      // Retrieve wallet data
      const walletData = await createPrivyWallet();

      // Execute the borrow transaction
      const borrowHash = await walletClient.writeContract({
        account: await createPrivyViemAccount(),
        abi: AAVE_LENDING_POOL_ABI_TESTNET,
        address: AAVE_LENDING_POOL_ADDRESS,
        functionName: "borrow",
        args: [
          assetAddress,
          amountInWei,
          interestRateMode,
          0,
          walletData.address,
        ],
      });

      console.log(`Borrow transaction hash: ${borrowHash}`);

      // Waiting for transaction completion
      await client.waitForTransactionReceipt({ hash: borrowHash });

      return borrowHash;
    } catch (error) {
      console.error("Error in borrowCryptoTool:", error);
      return null;
    }
  },
  {
    name: "borrow_crypto",
    description:
      "Borrow a specified amount of a cryptocurrency asset from AAVE Lending Pool.",
    schema: z.object({
      amount: z
        .number()
        .positive()
        .describe("The amount of cryptocurrency to borrow."),
      assetAddress: z
        .string()
        .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address")
        .transform((val) => val as `0x${string}`)
        .describe("The address of the cryptocurrency asset."),
    }),
  },
);

/**
 * Method of lending cryptocurrency
 * @param amount
 * @param assetAddress
 * @returns
 */
const lendCrypto = tool(
  async (input: { amount: number; assetAddress: `0x${string}` }) => {
    try {
      const { amount, assetAddress } = input;

      // Get the token decimals.
      const decimals = (await client.readContract({
        abi: ERC20_ABI,
        address: assetAddress,
        functionName: "decimals",
      })) as number;

      console.log(`Decimals: ${decimals}`);
      // Convert units
      const amountInWei = parseUnits(amount.toString(), decimals);
      console.log(`amountInWei: ${amountInWei}`);

      // Execute the approval transaction
      const approveHash = await walletClient.writeContract({
        account: await createPrivyViemAccount(),
        abi: ERC20_ABI,
        address: assetAddress,
        functionName: "approve",
        args: [AAVE_LENDING_POOL_ADDRESS, amountInWei],
      });
      console.log(`Approval transaction hash: ${approveHash}`);

      // Wait for approval completion.
      await client.waitForTransactionReceipt({ hash: approveHash });

      // Retrieve wallet data
      const walletData = await createPrivyWallet();

      // Supply tokens to the AAVE Lending Pool
      const supplyHash = await walletClient.writeContract({
        account: await createPrivyViemAccount(),
        abi: AAVE_LENDING_POOL_ABI_TESTNET,
        address: AAVE_LENDING_POOL_ADDRESS,
        functionName: "supply",
        args: [assetAddress, amountInWei, walletData.address, 0],
      });
      console.log(`Supply transaction hash: ${supplyHash}`);

      // Waiting for transaction completion
      await client.waitForTransactionReceipt({ hash: supplyHash });

      return supplyHash;
    } catch (error) {
      console.error("Error in lendCryptoTool:", error);
      return null;
    }
  },
  {
    name: "lend_crypto",
    description:
      "Lend a specified amount of a cryptocurrency asset to the AAVE Lending Pool.",
    schema: z.object({
      amount: z
        .number()
        .positive()
        .describe("The amount of cryptocurrency to lend."),
      assetAddress: z
        .string()
        .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address")
        .transform((val) => val as `0x${string}`)
        .describe("The address of the cryptocurrency asset."),
    }),
  },
);

/**
 * Method for obtaining user asset information
 * @returns
 */
const getUserAccountData = tool(
  async (input: { userAddress: `0x${string}` }) => {
    try {
      const { userAddress } = input;

      // Retrieving asset data from AAVE contracts
      // Call the getUserAccountData function
      const accountData = (await client.readContract({
        abi: AAVE_LENDING_POOL_ABI_TESTNET,
        address: AAVE_LENDING_POOL_ADDRESS,
        functionName: "getUserAccountData",
        args: [userAddress],
      })) as [bigint, bigint, bigint, bigint, bigint, bigint];

      console.log(`Account data: ${accountData}`);

      // Return the formatted results
      return {
        totalCollateralBase: Number(accountData[0]),
        totalDebtBase: Number(accountData[1]),
        availableBorrowsBase: Number(accountData[2]),
        currentLiquidationThreshold: Number(accountData[3]),
        ltv: Number(accountData[4]),
        healthFactor: Number(accountData[5]) / 1e18,
      };
    } catch (error) {
      console.error("Error in getUserAccountDataTool:", error);
      return null;
    }
  },
  {
    name: "get_user_account_data",
    description:
      "Retrieve the user's account data from AAVE, including collateral, debt, and health factor.",
    schema: z.object({
      userAddress: z
        .string()
        .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address")
        .transform((val) => val as `0x${string}`)
        .describe("The user's wallet address."),
    }),
  },
);

/**
 * Method for obtaining the user's token balance
 * @param tokenAddress
 * @param userAddress
 * @returns
 */
const getTokenBalance = tool(
  async (input: {
    tokenAddress: `0x${string}`;
    userAddress?: `0x${string}`;
  }) => {
    try {
      const { tokenAddress, userAddress } = input;
      let finalUserAddress = userAddress;

      // Retrieve wallet data
      const walletData = await createPrivyWallet();

      // If no user address is specified, the walletClient address is used by default.
      if (!finalUserAddress) {
        finalUserAddress = walletData.address as `0x${string}`;
      }

      // Get the token balance
      const balance = await client.readContract({
        abi: ERC20_ABI,
        address: tokenAddress,
        functionName: "balanceOf",
        args: [finalUserAddress],
      });

      // Get the token decimals.
      const decimals = await client.readContract({
        abi: ERC20_ABI,
        address: tokenAddress,
        functionName: "decimals",
        args: [],
      });

      // Adjust the balance (divide the balance) to match the decimal
      const balanceInDecimal = Number(balance) / 10 ** (decimals as number);

      return balanceInDecimal;
    } catch (error) {
      console.error(`Error in getTokenBalanceTool: ${error}`);
      return null;
    }
  },
  {
    name: "get_token_balance",
    description:
      "Get the token balance of the user for the given token address.",
    schema: z.object({
      tokenAddress: z
        .string()
        .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address")
        .transform((val) => val as `0x${string}`)
        .describe("The token contract address."),
      userAddress: z
        .string()
        .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address")
        .optional()
        .transform((val) => val as `0x${string}`)
        .describe(
          "The user's wallet address (optional). If not provided, defaults to the walletClient address.",
        ),
    }),
  },
);

export { borrowCrypto, getTokenBalance, getUserAccountData, lendCrypto };
