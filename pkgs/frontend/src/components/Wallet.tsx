"use client";
import {
  Address,
  Avatar,
  EthBalance,
  Identity,
  Name,
} from "@coinbase/onchainkit/identity";
import {
  ConnectWallet,
  ConnectWalletText,
  Wallet,
  WalletDropdown,
  WalletDropdownDisconnect,
  WalletDropdownFundLink,
  WalletDropdownLink,
} from "@coinbase/onchainkit/wallet";

export function WalletComponent({
  darkMode,
  setDarkMode,
}: { darkMode: boolean; setDarkMode: (value: boolean) => void }) {
  return (
    <div className="flex justify-end">
      <Wallet>
        <ConnectWallet className="bg-yellow-400 py-2 px-4 rounded-md hover:bg-yellow-500 text-black">
          <ConnectWalletText className="text-black">Log In</ConnectWalletText>
          <Avatar className="h-6 w-6" />
          <Name className="text-black" />
        </ConnectWallet>
        <WalletDropdown>
          <Identity
            className="px-4 pt-3 pb-2 hover:bg-blue-200"
            hasCopyAddressOnClick
          >
            <Avatar />
            <Name />
            <Address />
            <EthBalance />
          </Identity>
          <WalletDropdownLink
            className="hover:bg-blue-200"
            icon="wallet"
            href="https://keys.coinbase.com"
          >
            Wallet
          </WalletDropdownLink>
          <WalletDropdownFundLink className="hover:bg-blue-200" />
          <WalletDropdownDisconnect className="hover:bg-blue-200" />
          <label className="flex items-center justify-between cursor-pointer px-4 py-4 hover:bg-blue-200">
            <span className="text-sm flex items-center">
              <span className="mr-2">🌙</span> Dark Mode
            </span>
            <span className="relative">
              <input
                type="checkbox"
                checked={darkMode}
                onChange={() => setDarkMode(!darkMode)}
                className="hidden"
              />
              <span className="block w-10 h-6 bg-gray-300 rounded-full shadow-inner" />
              <span
                className={`absolute block w-4 h-4 mt-1 ml-1 rounded-full shadow inset-y-0 left-0 focus-within:shadow-outline transition-transform duration-200 ease-in-out ${
                  darkMode
                    ? "transform translate-x-full bg-blue-500"
                    : "bg-white"
                }`}
              />
            </span>
          </label>
        </WalletDropdown>
      </Wallet>
    </div>
  );
}
