/**
 * Blockchain Service for Polygon Amoy Testnet
 * Handles logging application data to the blockchain
 */

import { JsonRpcProvider, Wallet, keccak256, toUtf8Bytes } from "ethers";

// Polygon Amoy Testnet Configuration
const POLYGON_AMOY_CHAIN_ID = 80002;
const POLYGON_AMOY_RPC_URL =
  process.env.POLYGON_AMOY_RPC_URL || "https://rpc-amoy.polygon.technology";

// Burn address for storing data (0xdead)
const BURN_ADDRESS = "0x000000000000000000000000000000000000dEaD";

/**
 * Get Polygon Amoy provider instance
 */
export function getPolygonAmoyProvider(): JsonRpcProvider {
  return new JsonRpcProvider(POLYGON_AMOY_RPC_URL, {
    name: "amoy",
    chainId: POLYGON_AMOY_CHAIN_ID,
  });
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
    const wallet = getBlockchainWallet();
    const timestamp = new Date().toISOString();

    // Create hash identifier
    const applicationHash = createApplicationHash(
      applicationId,
      userId,
      timestamp
    );

    // Encode the hash as transaction data
    // We'll send it to a burn address with the hash in the data field
    // keccak256 already returns a string with 0x prefix
    // Gas calculation: 21000 (base) + 16 per zero byte + 68 per non-zero byte
    // Hash is 32 bytes (64 hex chars), so approximately 21000 + (32 * 68) = 23296
    // Using 25000 to be safe
    const tx = await wallet.sendTransaction({
      to: BURN_ADDRESS,
      data: applicationHash,
      // Increased gas limit to accommodate data field (hash is 32 bytes)
      gasLimit: 25000,
    });

    // Wait for transaction to be mined
    const receipt = await tx.wait();

    if (!receipt) {
      throw new Error("Transaction receipt is null");
    }

    return receipt.hash;
  } catch (error) {
    console.error("Error logging application to blockchain:", error);
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
    const timestamp = new Date().toISOString();
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
