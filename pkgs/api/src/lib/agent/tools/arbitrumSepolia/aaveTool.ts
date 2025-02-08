import { tool } from "@langchain/core/tools";
import * as dotenv from "dotenv";
import { http, createPublicClient, createWalletClient, parseUnits } from "viem";
import { arbitrumSepolia } from "viem/chains";
import { z } from "zod";
import { createPrivyViemAccount, createPrivyWallet } from "../../wallet/privy";
import { AAVE_LENDING_POOL_ABI_TESTNET } from "../abis/aave_lending_pool_abi_testnet";
import { ERC20_ABI } from "../abis/erc20_abi";

dotenv.config();

const { ALCHEMY_API_KEY } = process.env;

// コントラクトのアドレス(arbitrum Sepolia)
const AAVE_LENDING_POOL_ADDRESS = "0xBfC91D59fdAA134A4ED45f7B584cAf96D7792Eff";

// public Clientとwallet Clientを作成
const client = createPublicClient({
  chain: arbitrumSepolia,
  transport: http(`https://arb-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`),
});
const walletClient = createWalletClient({
  transport: http(`https://arb-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`),
  chain: arbitrumSepolia,
});

/**
 * 暗号通貨を借り入れる ForArbitrumSepolia
 * @param amount 借りる暗号通貨の量
 * @param assetAddress 借りる資産のコントラクトアドレス
 * @param interestRateMode 利率モード（1: 固定金利、2: 変動金利）
 * @returns トランザクションハッシュまたは null
 */
const borrowCryptoForArbitrumSepolia = tool(
  async (input: {
    amount: number;
    assetAddress: `0x${string}`;
  }) => {
    try {
      const interestRateMode = 2;
      const { amount, assetAddress } = input;

      // トークンのデシマル数を取得
      const decimals = (await client.readContract({
        abi: ERC20_ABI,
        address: assetAddress,
        functionName: "decimals",
      })) as number;

      console.log(`Decimals: ${decimals}`);

      // 借入額をトークン単位に変換
      const amountInWei = parseUnits(amount.toString(), decimals);

      // walllet dataを取得
      const walletData = await createPrivyWallet();

      // 借入トランザクションの実行
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

      // トランザクション完了待ち
      await client.waitForTransactionReceipt({ hash: borrowHash });

      return borrowHash;
    } catch (error) {
      console.error("Error in borrowCryptoTool:", error);
      return null;
    }
  },
  {
    name: "borrow_crypto_on_arbitrum_sepolia",
    description:
      "Borrow a specified amount of a cryptocurrency asset from AAVE Lending Pool on Arbitrum Sepolia.",
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
 * 暗号通貨を貸し出すメソッド ForArbitrumSepolia
 * @param amount
 * @param assetAddress
 * @returns
 */
const lendCryptoForArbitrumSepolia = tool(
  async (input: { amount: number; assetAddress: `0x${string}` }) => {
    try {
      const { amount, assetAddress } = input;

      // トークンのデシマル数を取得
      const decimals = (await client.readContract({
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
        args: [AAVE_LENDING_POOL_ADDRESS, amountInWei],
      });
      console.log(`Approval transaction hash: ${approveHash}`);

      // 承認の完了を待つ
      await client.waitForTransactionReceipt({ hash: approveHash });

      // walllet dataを取得
      const walletData = await createPrivyWallet();

      // トークンをAAVE Lending Poolに供給
      const supplyHash = await walletClient.writeContract({
        account: await createPrivyViemAccount(),
        abi: AAVE_LENDING_POOL_ABI_TESTNET,
        address: AAVE_LENDING_POOL_ADDRESS,
        functionName: "supply",
        args: [assetAddress, amountInWei, walletData.address, 0],
      });
      console.log(`Supply transaction hash: ${supplyHash}`);

      // トランザクション完了待ち
      await client.waitForTransactionReceipt({ hash: supplyHash });

      return supplyHash;
    } catch (error) {
      console.error("Error in lendCryptoTool:", error);
      return null;
    }
  },
  {
    name: "lend_crypto_on_arbitrum_sepolia",
    description:
      "Lend a specified amount of a cryptocurrency asset to the AAVE Lending Pool on Arbitrum Sepolia.",
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
 * ユーザーの資産情報を取得するメソッド ForArbitrumSepolia
 * @returns
 */
const getUserAccountDataForArbitrumSepolia = tool(
  async (input: { userAddress: `0x${string}` }) => {
    try {
      const { userAddress } = input;

      // AAVEコントラクトから資産データを取得
      // getUserAccountData関数を呼び出す
      const accountData = (await client.readContract({
        abi: AAVE_LENDING_POOL_ABI_TESTNET,
        address: AAVE_LENDING_POOL_ADDRESS,
        functionName: "getUserAccountData",
        args: [userAddress],
      })) as [bigint, bigint, bigint, bigint, bigint, bigint];

      console.log(`Account data: ${accountData}`);

      // 結果を整形して返却
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
    name: "get_user_account_data_on_arbitrum_sepolia",
    description:
      "Retrieve the user's account data from AAVE, including collateral, debt, and health factor on Arbitrum Sepolia.",
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
 * ユーザーのトークンの残高を取得するメソッド ForArbitrumSepolia
 * @param tokenAddress
 * @param userAddress
 * @returns
 */
const getTokenBalanceForArbitrumSepolia = tool(
  async (input: {
    tokenAddress: `0x${string}`;
    userAddress?: `0x${string}`;
  }) => {
    try {
      const { tokenAddress, userAddress } = input;
      let finalUserAddress = userAddress;

      // walllet dataを取得
      const walletData = await createPrivyWallet();

      // ユーザーアドレスが指定されていない場合、デフォルトで walletClient のアドレスを使用
      if (!finalUserAddress) {
        finalUserAddress = walletData.address as `0x${string}`;
      }

      // トークンの残高を取得
      const balance = await client.readContract({
        abi: ERC20_ABI,
        address: tokenAddress,
        functionName: "balanceOf",
        args: [finalUserAddress],
      });

      // トークンのデシマル数を取得
      const decimals = await client.readContract({
        abi: ERC20_ABI,
        address: tokenAddress,
        functionName: "decimals",
        args: [],
      });

      // Decimalに合わせて残高を調整（balanceを割る）
      const balanceInDecimal = Number(balance) / 10 ** (decimals as number);

      return balanceInDecimal;
    } catch (error) {
      console.error(`Error in getTokenBalanceTool: ${error}`);
      return null;
    }
  },
  {
    name: "get_token_balance_on_arbitrum_sepolia",
    description:
      "Get the token balance of the user for the given token address on Arbitrum Sepolia.",
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

export {
  borrowCryptoForArbitrumSepolia,
  getTokenBalanceForArbitrumSepolia,
  getUserAccountDataForArbitrumSepolia,
  lendCryptoForArbitrumSepolia,
};
