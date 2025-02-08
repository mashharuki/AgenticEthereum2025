"use client";
import { http, createConfig } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { coinbaseWallet } from "wagmi/connectors";

export const config = createConfig({
  chains: [baseSepolia],
  connectors: [
    coinbaseWallet({
      appName: "onchainkit",
    }),
  ],
  ssr: true,
  transports: {
    [baseSepolia.id]: http(),
  },
});
