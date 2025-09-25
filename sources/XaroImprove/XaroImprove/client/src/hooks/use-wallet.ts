import { useState, createContext, useContext } from "react";

interface WalletContextType {
  walletConnected: boolean;
  walletAddress: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    // Fallback implementation when used outside provider
    const [walletConnected, setWalletConnected] = useState(false);
    const [walletAddress, setWalletAddress] = useState<string | null>(null);

    const connectWallet = async () => {
      // TODO: Implement proper Sui wallet connection using @mysten/dapp-kit
      // For now, simulate wallet connection
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate mock address for development
      const mockAddress = '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
      
      setWalletConnected(true);
      setWalletAddress(mockAddress);
    };

    const disconnectWallet = () => {
      setWalletConnected(false);
      setWalletAddress(null);
    };

    return {
      walletConnected,
      walletAddress,
      connectWallet,
      disconnectWallet,
    };
  }
  return context;
}

// Temporarily disabled due to build issues
// export function WalletProvider({ children }: { children: React.ReactNode }) {
//   return children;
// }