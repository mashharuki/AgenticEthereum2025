"use client";
import Link from "next/link";
import React from "react";
import { useAccount } from "wagmi";
import { TipButton } from "./Tip";
import { WalletComponent } from "./Wallet";

export function Header({
  darkMode,
  setDarkMode,
}: { darkMode: boolean; setDarkMode: (value: boolean) => void }) {
  const { address } = useAccount();

  return (
    <header className="w-full">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <Link
            href="/"
            className="text-2xl font-bold text-black dark:text-white"
          >
            Agent DeFi Sphere
          </Link>
        </div>
        <div className="flex items-center space-x-2">
          {address && <TipButton />}
          <WalletComponent darkMode={darkMode} setDarkMode={setDarkMode} />
        </div>
      </div>
    </header>
  );
}
