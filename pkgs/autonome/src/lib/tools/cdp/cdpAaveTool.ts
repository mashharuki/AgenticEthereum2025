import {
  type EvmWalletProvider,
  customActionProvider,
} from "@coinbase/agentkit";
import { http, createPublicClient, encodeFunctionData, parseUnits } from "viem";
import { baseSepolia } from "viem/chains";
import { z } from "zod";
import { AAVE_LENDING_POOL_ABI_TESTNET } from "../abis/aave_lending_pool_abi_testnet";
import { ERC20_ABI } from "../abis/erc20_abi";

// AAVE Lending Pool contract address (Base Sepolia)
const AAVE_LENDING_POOL_ADDRESS = "0x07eA79F68B2B3df564D0A34F8e19D9B1e339814b";

// public Clientを作成
const client = createPublicClient({
  chain: baseSepolia,
  transport: http("https://sepolia.base.org"),
});

const BorrowCryptoInput = z
  .object({
    amount: z
      .number()
      .positive()
      .describe("The amount of cryptocurrency to borrow."),
    assetAddress: z
      .string()
      .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address")
      .transform((val) => val as `0x${string}`)
      .describe("The address of the cryptocurrency asset."),
  })
  .describe("Borrow crypto from AAVE Lending Pool");

const LendCryptoInput = z
  .object({
    amount: z
      .number()
      .positive()
      .describe("The amount of cryptocurrency to lend."),
    assetAddress: z
      .string()
      .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address")
      .transform((val) => val as `0x${string}`)
      .describe("The address of the cryptocurrency asset."),
  })
  .describe("Lend crypto to AAVE Lending Pool");

const GetUserAccountDataInput = z
  .object({
    userAddress: z
      .string()
      .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address")
      .transform((val) => val as `0x${string}`)
      .describe("The user's wallet address."),
  })
  .describe("Retrieve the user's account data from AAVE");

const GetTokenBalanceInput = z
  .object({
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
      .describe("The user's wallet address (optional)."),
  })
  .describe("Get the token balance for the given token address.");

// ==========================================================================================
// 各種ツールの作成
//　==========================================================================================

/**
 * Borrow crypto tool
 * @param wallet
 * @param args
 * @returns
 */
export const createBorrowCryptoToolForCdp =
  customActionProvider<EvmWalletProvider>({
    name: "borrow_crypto",
    description: "Borrow cryptocurrency from AAVE.",
    schema: BorrowCryptoInput,
    invoke: async (walletProvider, args) => {
      const { amount, assetAddress } = args;
      const interestRateMode = 2;

      console.log(`assetAddress: ${assetAddress}`);

      try {
        const decimals = (await client.readContract({
          abi: ERC20_ABI,
          address: assetAddress,
          functionName: "decimals",
        })) as number;

        const amountInWei = parseUnits(amount.toString(), decimals);

        console.log(`decimals: ${decimals}`);
        console.log(`Amount in Wei: ${amountInWei.toString()}`);

        // walletAddress
        const walletAddress = await walletProvider.getAddress();
        console.log("wallet address:", walletAddress);

        // borrow method call
        const borrowHash = await walletProvider.sendTransaction({
          to: AAVE_LENDING_POOL_ADDRESS,
          data: encodeFunctionData({
            abi: AAVE_LENDING_POOL_ABI_TESTNET,
            functionName: "borrow",
            args: [
              assetAddress,
              amountInWei.toString(),
              interestRateMode,
              0,
              walletAddress,
            ],
          }),
        });

        const result =
          await walletProvider.waitForTransactionReceipt(borrowHash);

        return `Borrow transaction : ${borrowHash}`;
      } catch (error) {
        console.error("Error executing lend_crypto:", error);
        return "Error executing lend_crypto";
      }
    },
  });

/**
 * Lend crypto tool
 * @param wallet
 * @param args
 * @returns
 */
export const createLendCryptoToolForCdp =
  customActionProvider<EvmWalletProvider>({
    name: "lend_crypto",
    description: "Lend cryptocurrency to AAVE.",
    schema: LendCryptoInput,
    invoke: async (walletProvider, args) => {
      const { amount, assetAddress } = args;

      try {
        console.log("assetAddress:", assetAddress);

        const decimals = (await client.readContract({
          abi: ERC20_ABI,
          address: assetAddress as `0x${string}`,
          functionName: "decimals",
        })) as number;

        const amountInWei = parseUnits(amount.toString(), decimals).toString();

        console.log(`decimals: ${decimals}`);
        console.log(`Amount in Wei: ${amountInWei}`);

        // walletAddress
        const walletAddress = await walletProvider.getAddress();
        console.log("wallet address:", walletAddress);

        // トランザクションデータ
        const tx = {
          from: walletAddress as `0x${string}`,
          to: assetAddress as `0x${string}`,
          data: encodeFunctionData({
            abi: ERC20_ABI,
            functionName: "approve",
            args: [AAVE_LENDING_POOL_ADDRESS, amountInWei],
          }),
        };

        // approve method call
        const approveHash = await walletProvider.sendTransaction(tx);

        const result =
          await walletProvider.waitForTransactionReceipt(approveHash);

        console.log(`Approve transaction: ${approveHash}`);

        // supply method call
        const supplyHash = await await walletProvider.sendTransaction({
          from: walletAddress as `0x${string}`,
          to: AAVE_LENDING_POOL_ADDRESS,
          data: encodeFunctionData({
            abi: AAVE_LENDING_POOL_ABI_TESTNET,
            functionName: "supply",
            args: [assetAddress, amountInWei, walletAddress, 0],
          }),
        });

        const result2 =
          await walletProvider.waitForTransactionReceipt(supplyHash);

        console.log(`Supply transaction: ${supplyHash}`);

        return `Supply transaction hash: ${supplyHash}`;
      } catch (error) {
        console.error("Error executing lend_crypto:", error);
        return "Error executing lend_crypto";
      }
    },
  });

/**
 * Get user account data tool
 * @param wallet
 * @param args
 * @returns
 */
export const createGetUserAccountDataToolForCdp =
  customActionProvider<EvmWalletProvider>({
    name: "get_user_account_data",
    description: "Retrieve user account data from AAVE.",
    schema: GetUserAccountDataInput,
    invoke: async (walletProvider, args) => {
      const { userAddress } = args;
      // call getUserAccountData method
      const accountData = (await client.readContract({
        abi: AAVE_LENDING_POOL_ABI_TESTNET,
        address: AAVE_LENDING_POOL_ADDRESS,
        functionName: "getUserAccountData",
        args: [userAddress],
      })) as [bigint, bigint, bigint, bigint, bigint, bigint];

      return {
        totalCollateralBase: Number(accountData[0]),
        totalDebtBase: Number(accountData[1]),
        availableBorrowsBase: Number(accountData[2]),
        currentLiquidationThreshold: Number(accountData[3]),
        ltv: Number(accountData[4]),
        healthFactor: Number(accountData[5]) / 1e18,
      };
    },
  });

/**
 * Get token balance tool
 * @param wallet
 * @param args
 * @returns
 */
export const createGetTokenBalanceToolForCdp =
  customActionProvider<EvmWalletProvider>({
    name: "get_token_balance",
    description: "Get token balance for a given user.",
    schema: GetTokenBalanceInput,
    invoke: async (walletProvider, args) => {
      const { tokenAddress, userAddress } = args;
      // get user address
      const finalUserAddress =
        userAddress || (await walletProvider.getAddress());

      const balance = await client.readContract({
        abi: ERC20_ABI,
        address: tokenAddress,
        functionName: "balanceOf",
        args: [finalUserAddress],
      });

      const decimals = await client.readContract({
        abi: ERC20_ABI,
        address: tokenAddress,
        functionName: "decimals",
      });

      return Number(balance) / 10 ** (decimals as number);
    },
  });
