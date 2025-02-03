import { task } from "hardhat/config";
import type { HardhatRuntimeEnvironment } from "hardhat/types";
import { formatEther } from "viem";
import { getContractAddress } from "../../helpers/contractJsonHelper";

/**
 * 【Task】	call read method of sample contract
 */
task("callReadMethod", "call read method of sample contract").setAction(
  async (hre: HardhatRuntimeEnvironment) => {
    console.log(
      "################################### [START] ###################################",
    );

    // get wallet client
    const [owner] = await hre.viem.getWalletClients();
    const publicClient = await hre.viem.getPublicClient();
    // get chain ID
    const chainId = (await publicClient.getChainId()).toString();
    // get contract name
    const contractName = "LockModule#Lock";
    // get contract address
    const contractAddress = getContractAddress(chainId, contractName);

    console.log(`
            ${contractName} 's address is ${contractAddress}
        `);

    // create Contract instance
    const lock = await hre.viem.getContractAt(
      "Lock",
      contractAddress as `0x${string}`,
      {
        client: { wallet: owner },
      },
    );

    // call read method
    const unlockTime = await lock.read.unlockTime();
    const ownerAddress = await lock.read.owner();
    // get contract's balance
    const contractBalance = await publicClient.getBalance({
      address: contractAddress as `0x${string}`,
    });

    console.log(`
            unlockTimes : ${unlockTime}
            ownerAddress: ${ownerAddress}
            contractBalance: ${formatEther(contractBalance)} ETH
        `);

    console.log(
      "################################### [END] ###################################",
    );
  },
);
