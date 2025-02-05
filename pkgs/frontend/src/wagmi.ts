"use client";
import { useMemo } from "react";
import { http, createConfig } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { coinbaseWallet } from "wagmi/connectors";

export function useWagmiConfig() {
  return useMemo(() => {
    const wagmiConfig = createConfig({
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

    return wagmiConfig;
  }, []);
}
