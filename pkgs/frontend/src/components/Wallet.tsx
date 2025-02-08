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

export function WalletComponent() {
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
          <WalletDropdownFundLink />
          <WalletDropdownDisconnect className="hover:bg-blue-200" />
        </WalletDropdown>
      </Wallet>
    </div>
  );
}
