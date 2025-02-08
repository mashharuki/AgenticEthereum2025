"use client";
import Link from "next/link";
import React from "react";
import { useAccount } from "wagmi";
import { TipButton } from "./Tip";
import { WalletComponent } from "./Wallet";

export function Header() {
  const { address } = useAccount();

  return (
    <header className="w-full bg-white shadow-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="text-2xl font-bold text-gray-600">
            Agent DeFi Sphere
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          {address && <TipButton />}
          <WalletComponent />
        </div>
      </div>
    </header>
  );
}
