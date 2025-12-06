/**
 * Blockchain Service for Polygon Amoy Testnet
 * Handles logging application data to the blockchain
 */

import { JsonRpcProvider, Wallet, keccak256, toUtf8Bytes } from "ethers";
import { getCurrentTimePH } from "@/lib/utils/date-formatting";

// Polygon Amoy Testnet Configuration
const POLYGON_AMOY_CHAIN_ID = 80002;
const POLYGON_AMOY_RPC_URL =
  process.env.POLYGON_AMOY_RPC_URL || "https://rpc-amoy.polygon.technology";

// Fallback RPC URLs
const POLYGON_AMOY_FALLBACK_RPCS = [
  "https://rpc-amoy.polygon.technology",
  "https://polygon-amoy.blockpi.network/v1/rpc/public",
  "https://polygon-amoy-bor-rpc.publicnode.com",
];

// Burn address for storing data (0xdead)
const BURN_ADDRESS = "0x000000000000000000000000000000000000dEaD";

/**
 * Get Polygon Amoy provider instance with fallback support
 */
export function getPolygonAmoyProvider(): JsonRpcProvider {
  const rpcUrl =
    process.env.POLYGON_AMOY_RPC_URL || POLYGON_AMOY_FALLBACK_RPCS[0];

  try {
    return new JsonRpcProvider(rpcUrl, {
      name: "amoy",
      chainId: POLYGON_AMOY_CHAIN_ID,
    });
  } catch (error) {
    console.error("Failed to create provider with primary RPC:", rpcUrl);
    console.log("Trying fallback RPC...");

    // Try fallback RPCs
    for (const fallbackRpc of POLYGON_AMOY_FALLBACK_RPCS) {
      if (fallbackRpc !== rpcUrl) {
        try {
          console.log("Attempting connection to:", fallbackRpc);
          return new JsonRpcProvider(fallbackRpc, {
            name: "amoy",
            chainId: POLYGON_AMOY_CHAIN_ID,
          });
        } catch (fallbackError) {
          console.error("Fallback RPC failed:", fallbackRpc);
        }
      }
    }

    throw new Error("All RPC endpoints failed");
  }
}

/**
 * Get blockchain wallet instance from private key
 */
export function getBlockchainWallet(): Wallet {
  const privateKey = process.env.POLYGON_AMOY_PRIVATE_KEY;

  if (!privateKey) {
    throw new Error("POLYGON_AMOY_PRIVATE_KEY environment variable is not set");
  }

  const provider = getPolygonAmoyProvider();
  return new Wallet(privateKey, provider);
}

/**
 * Create a hash identifier from application data
 */
function createApplicationHash(
  applicationId: string,
  userId: string,
  timestamp: string
): string {
  const data = `${applicationId}-${userId}-${timestamp}`;
  return keccak256(toUtf8Bytes(data));
}

function createAwardingHash(
  awardingId: string,
  applicationId: string,
  amount: number,
  timestamp: string
): string {
  const data = `${awardingId}-${applicationId}-${amount}-${timestamp}`;
  return keccak256(toUtf8Bytes(data));
}

/**
 * Log application to blockchain
 * @param applicationId - The application ID
 * @param userId - The user ID who submitted the application
 * @returns Transaction hash if successful, null if failed
 */
export async function logApplicationToBlockchain(
  applicationId: string,
  userId: string
): Promise<string | null> {
  try {
    console.log("Starting blockchain logging...");
    console.log("Application ID:", applicationId);
    console.log("User ID:", userId);

    const wallet = getBlockchainWallet();
    console.log("Wallet address:", wallet.address);

    const timestamp = getCurrentTimePH();

    // Create hash identifier
    const applicationHash = createApplicationHash(
      applicationId,
      userId,
      timestamp
    );
    console.log("Application hash:", applicationHash);

    // Check wallet balance
    const provider = wallet.provider;
    if (!provider) {
      throw new Error("Wallet provider is not initialized");
    }

    const balance = await provider.getBalance(wallet.address);
    console.log("Wallet balance (MATIC):", balance.toString());

    if (balance === BigInt(0)) {
      console.warn("Wallet has no MATIC balance for gas fees");
      return null;
    }

    // Encode the hash as transaction data
    // We'll send it to a burn address with the hash in the data field
    // keccak256 already returns a string with 0x prefix
    // Gas calculation: 21000 (base) + 16 per zero byte + 68 per non-zero byte
    // Hash is 32 bytes (64 hex chars), so approximately 21000 + (32 * 68) = 23296
    // Using 25000 to be safe
    console.log("Sending transaction...");
    const tx = await wallet.sendTransaction({
      to: BURN_ADDRESS,
      data: applicationHash,
      // Increased gas limit to accommodate data field (hash is 32 bytes)
      gasLimit: 25000,
    });
    console.log("Transaction sent:", tx.hash);

    // Wait for transaction to be mined
    console.log("Waiting for confirmation...");
    const receipt = await tx.wait();

    if (!receipt) {
      throw new Error("Transaction receipt is null");
    }

    console.log("Transaction confirmed:", receipt.hash);
    return receipt.hash;
  } catch (error) {
    console.error("Error logging application to blockchain:", error);
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    // Return null instead of throwing to allow application submission to continue
    return null;
  }
}

export async function logAwardingToBlockchain(
  awardingId: string,
  applicationId: string,
  amount: number
): Promise<string | null> {
  try {
    const wallet = getBlockchainWallet();
    const timestamp = getCurrentTimePH();
    const awardingHash = createAwardingHash(
      awardingId,
      applicationId,
      amount,
      timestamp
    );

    const tx = await wallet.sendTransaction({
      to: BURN_ADDRESS,
      data: awardingHash,
      gasLimit: 25000,
    });

    const receipt = await tx.wait();
    if (!receipt) {
      throw new Error("Awarding transaction receipt is null");
    }

    return receipt.hash;
  } catch (error) {
    console.error("Error logging awarding to blockchain:", error);
    return null;
  }
}

/**
 * Verify if a transaction hash exists on the blockchain
 * @param transactionHash - The transaction hash to verify
 * @returns True if transaction exists and is confirmed, false otherwise
 */
export async function verifyTransaction(
  transactionHash: string
): Promise<boolean> {
  try {
    const provider = getPolygonAmoyProvider();
    const receipt = await provider.getTransactionReceipt(transactionHash);
    return receipt !== null && receipt.status === 1;
  } catch (error) {
    console.error("Error verifying transaction:", error);
    return false;
  }
}
