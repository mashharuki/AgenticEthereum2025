"use client";
import { Button } from "@/components/ui/button";
import {
  Transaction,
  TransactionButton,
  TransactionSponsor,
  TransactionStatus,
  TransactionStatusAction,
  TransactionStatusLabel,
} from "@coinbase/onchainkit/transaction";
import type { LifecycleStatus } from "@coinbase/onchainkit/transaction";
import React, { useState, useCallback } from "react";
import { parseEther } from "viem";
import { baseSepolia } from "viem/chains";
import { useAccount } from "wagmi";
import { Modal } from "./Modal";

export function TipButton() {
  const { address } = useAccount();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // アドレスがない場合は何も表示しない
  if (!address) {
    return null;
  }

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        className="bg-gray-100 text-black text-lg py-5 px-4 rounded-md hover:bg-gray-200"
      >
        Reward AI 🤖
      </Button>
      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <TipContent onComplete={() => setIsModalOpen(false)} />
        </Modal>
      )}
    </>
  );

  function TipContent({ onComplete }: { onComplete: () => void }) {
    const [amount, setAmount] = useState<string>("0.01");
    const [recipientAddress] = useState<string>(
      process.env.NEXT_PUBLIC_TIP_RECIPIENT_ADDRESS || "",
    );
    const { address } = useAccount();

    const maskedRecipientAddress = (): string => {
      if (!recipientAddress) return "";
      const start = recipientAddress.slice(0, 4);
      const end = recipientAddress.slice(-4);
      return `${start}...${end}`;
    };

    const handleStatus = useCallback(
      (status: LifecycleStatus) => {
        console.log("Transaction status:", status);
        if (status.statusName === "success") {
          setAmount("");
          onComplete();
        }
      },
      [onComplete],
    );

    const generateTransaction = useCallback(async () => {
      if (!amount || !recipientAddress) {
        throw new Error("送金額と送金先アドレスを入力してください");
      }

      return [
        {
          to: recipientAddress as `0x${string}`,
          value: parseEther(amount),
          data: "0x" as const,
        },
      ];
    }, [amount, recipientAddress]);

    if (!address) {
      return null;
    }

    return (
      <div className="p-6">
        <div className="space-y-4">
          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-2"
              htmlFor="recipient"
            >
              AI Agent Recipient Address
            </label>
            <input
              name="recipient"
              type="text"
              value={maskedRecipientAddress()}
              readOnly
              className="w-full px-3 py-2"
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-2"
              htmlFor="amount"
            >
              Tip Amount (ETH)
            </label>
            <input
              name="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              step="0.000000000000000001"
              min="0"
            />
          </div>

          <div>
            <Transaction
              chainId={baseSepolia.id}
              calls={generateTransaction}
              onStatus={handleStatus}
              className="text-black"
            >
              <TransactionButton
                text="Send Reward🔥"
                className="text-black bg-red-500 hover:bg-red-600"
              />
              <TransactionSponsor />
              <TransactionStatus>
                <TransactionStatusLabel />
                <TransactionStatusAction />
              </TransactionStatus>
            </Transaction>
          </div>
        </div>
      </div>
    );
  }
}
