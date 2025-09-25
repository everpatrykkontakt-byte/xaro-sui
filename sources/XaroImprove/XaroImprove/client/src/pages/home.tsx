import { useState, useEffect } from "react";
import { Moon, Sun, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WalletConnection } from "@/components/wallet-connection";
import { TokenTransfer } from "@/components/token-transfer";
import { TransactionHistory } from "@/components/transaction-history";
import { TokenStats } from "@/components/token-stats";
import { TransactionModal } from "@/components/transaction-modal";
import { useWallet } from "@/hooks/use-wallet";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [darkMode, setDarkMode] = useState(false);
  const { walletConnected, walletAddress } = useWallet();
  const { toast } = useToast();

  useEffect(() => {
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme === 'true') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    document.documentElement.classList.toggle('dark', newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
  };

  useEffect(() => {
    if (!walletConnected) {
      const timer = setTimeout(() => {
        toast({
          title: "Welcome to XARO Token!",
          description: "Connect your wallet to get started with token transfers and rewards.",
          duration: 5000,
        });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [walletConnected, toast]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg gradient-bg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">X</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">XARO Token</h1>
              <p className="text-sm text-muted-foreground">Sui Blockchain</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              data-testid="theme-toggle"
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            
            <WalletConnection />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Wallet Status */}
        {walletConnected && walletAddress && (
          <div className="mb-8 p-4 bg-card border border-border rounded-lg fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div>
                  <p className="font-medium">Wallet Connected</p>
                  <p className="text-sm text-muted-foreground font-mono break-all">
                    {walletAddress}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Column - Token Operations */}
          <div className="space-y-6">
            <TokenTransfer />
          </div>

          {/* Right Column - History and Stats */}
          <div className="space-y-6">
            <TransactionHistory />
            <TokenStats />
          </div>
        </div>

        {/* Transaction Modal will be managed via context in the future */}
      </main>
    </div>
  );
}
