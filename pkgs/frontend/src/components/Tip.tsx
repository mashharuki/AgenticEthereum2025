"use client";
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
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="bg-blue-600 text-white text-lg py-2.5 px-4 rounded-md hover:bg-blue-700"
      >
        Tip
      </button>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <TipContent onComplete={() => setIsModalOpen(false)} />
      </Modal>
    </>
  );
}

function TipContent({ onComplete }: { onComplete: () => void }) {
  const [amount, setAmount] = useState<string>("0.01");
  const [recipientAddress] = useState<string>(
    process.env.NEXT_PUBLIC_TIP_RECIPIENT_ADDRESS || "",
  );
  const { address } = useAccount();

  const maskedRecipientAddress = (): string => {
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

  const generateTransaction = useCallback(() => {
    if (!amount || !recipientAddress) {
      throw new Error("送金額と送金先アドレスを入力してください");
    }

    return [
      {
        to: recipientAddress as `0x${string}`,
        value: parseEther(amount),
        data: "0x",
      },
    ];
  }, [amount, recipientAddress]);

  return (
    <div className="p-6">
      {address && (
        <div className="space-y-4">
          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-2"
              htmlFor="recipient"
            >
              AI Agent Reciepient Address
            </label>
            <input
              name="recipient"
              type="text"
              value={maskedRecipientAddress()}
              readOnly={true}
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

          <Transaction
            chainId={baseSepolia.id}
            calls={async () => {
              const txs = await generateTransaction();
              return txs.map((tx) => ({
                ...tx,
                data: tx.data as `0x${string}`, // Cast string to hex string type
              }));
            }}
            onStatus={handleStatus}
          >
            <TransactionButton text="Send" className="bg-blue-600" />
            <TransactionSponsor />
            <TransactionStatus>
              <TransactionStatusLabel />
              <TransactionStatusAction />
            </TransactionStatus>
          </Transaction>
        </div>
      )}
    </div>
  );
}
