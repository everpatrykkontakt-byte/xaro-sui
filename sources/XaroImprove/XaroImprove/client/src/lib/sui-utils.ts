// TODO: Implement proper Sui utilities when integrating with @mysten/sui.js

export const SUI_PACKAGE_ID = process.env.VITE_SUI_PACKAGE_ID || "0x0";
export const SUI_NETWORK = process.env.VITE_SUI_NETWORK || "testnet";

export function generateTransactionCode(txHash: string): string {
  // Generate 45-digit code from transaction hash
  let code = '';
  const hashBytes = Buffer.from(txHash.replace('0x', ''), 'hex');
  
  for (let i = 0; i < 45; i++) {
    const byteIndex = i % hashBytes.length;
    const digit = hashBytes[byteIndex] % 10;
    code += digit.toString();
  }
  
  return code;
}

export function shortenAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function isValidSuiAddress(address: string): boolean {
  return address.startsWith('0x') && address.length >= 66;
}

export function formatTokenAmount(amount: string | number, decimals = 6): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return num.toFixed(decimals);
}

// Sui Move function names for the XARO token contract
export const MOVE_FUNCTIONS = {
  TRANSFER: 'transfer_tokens',
  MINT: 'mint_to',
  REWARD: 'reward_for_fix',
};

// Event types emitted by the XARO contract
export const EVENT_TYPES = {
  TRANSFER: 'TransferEvent',
};

export function parseTransferEvent(event: any) {
  // TODO: Parse actual Sui event data
  return {
    code: event.parsedJson?.code || '',
    from: event.parsedJson?.from || '',
    to: event.parsedJson?.to || '',
    amount: event.parsedJson?.amount || '0',
  };
}
