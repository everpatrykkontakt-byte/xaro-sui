import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWallet } from "@/hooks/use-wallet";

export function TokenStats() {
  const { walletAddress } = useWallet();

  // Mock data - in real implementation, these would come from the Sui blockchain
  const stats = {
    userBalance: 1247.5,
    totalSupply: 1000000,
    holdersCount: 1337,
    volume24h: 45672,
  };

  if (!walletAddress) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Token Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Connect your wallet to view token statistics
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Token Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Your Balance</p>
            <p className="text-lg font-bold" data-testid="text-user-balance">
              {stats.userBalance.toLocaleString()} XARO
            </p>
          </div>
          
          <div className="text-center p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Total Supply</p>
            <p className="text-lg font-bold" data-testid="text-total-supply">
              {stats.totalSupply.toLocaleString()} XARO
            </p>
          </div>
          
          <div className="text-center p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Holders</p>
            <p className="text-lg font-bold" data-testid="text-holders-count">
              {stats.holdersCount.toLocaleString()}
            </p>
          </div>
          
          <div className="text-center p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">24h Volume</p>
            <p className="text-lg font-bold" data-testid="text-volume-24h">
              {stats.volume24h.toLocaleString()} XARO
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
