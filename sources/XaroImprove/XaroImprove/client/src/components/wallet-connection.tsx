import { useState } from "react";
import { Wallet, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/hooks/use-wallet";
import { useToast } from "@/hooks/use-toast";

export function WalletConnection() {
  const { walletConnected, connectWallet, disconnectWallet } = useWallet();
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  const handleConnect = async () => {
    if (walletConnected) {
      disconnectWallet();
      toast({
        title: "Wallet Disconnected",
        description: "Your wallet has been disconnected successfully.",
      });
      return;
    }

    setIsConnecting(true);
    try {
      await connectWallet();
      toast({
        title: "Wallet Connected!",
        description: "Your wallet has been connected successfully.",
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to connect wallet. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Button
      onClick={handleConnect}
      disabled={isConnecting}
      className={walletConnected ? "bg-green-500 hover:bg-green-600" : ""}
      data-testid="connect-wallet-btn"
    >
      {isConnecting ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : walletConnected ? (
        <Check className="w-4 h-4" />
      ) : (
        <Wallet className="w-4 h-4" />
      )}
      <span className="ml-2">
        {isConnecting ? "Connecting..." : walletConnected ? "Connected" : "Connect Wallet"}
      </span>
    </Button>
  );
}
