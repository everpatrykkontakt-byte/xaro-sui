import { History, ArrowUp, ArrowDown, Gift, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/hooks/use-wallet";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";

interface Transaction {
  id: string;
  txHash: string;
  transactionCode: string;
  fromAddress: string;
  toAddress: string;
  amount: string;
  type: 'transfer' | 'mint' | 'reward';
  status: 'pending' | 'confirmed' | 'failed';
  createdAt: string;
  confirmedAt?: string;
}

export function TransactionHistory() {
  const { walletAddress } = useWallet();

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["/api/transactions", walletAddress],
    enabled: !!walletAddress,
  });

  const getTransactionIcon = (transaction: Transaction) => {
    const isOutgoing = transaction.fromAddress === walletAddress;
    const iconClass = "w-4 h-4";

    if (transaction.type === 'reward') {
      return <Gift className={`${iconClass} text-blue-500`} />;
    }

    if (transaction.status === 'pending') {
      return <Clock className={`${iconClass} text-orange-500`} />;
    }

    return isOutgoing ? 
      <ArrowUp className={`${iconClass} text-red-500`} /> : 
      <ArrowDown className={`${iconClass} text-green-500`} />;
  };

  const getTransactionAmount = (transaction: Transaction) => {
    const isOutgoing = transaction.fromAddress === walletAddress;
    const amount = parseFloat(transaction.amount);
    const prefix = isOutgoing ? '-' : '+';
    const color = isOutgoing ? 'text-red-500' : 'text-green-500';
    
    return (
      <span className={color}>
        {prefix}{amount.toFixed(6)} XARO
      </span>
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-500';
      case 'pending':
        return 'text-orange-500';
      case 'failed':
        return 'text-red-500';
      default:
        return 'text-muted-foreground';
    }
  };

  const getTransactionTitle = (transaction: Transaction) => {
    const isOutgoing = transaction.fromAddress === walletAddress;
    
    switch (transaction.type) {
      case 'reward':
        return 'Reward Claim';
      case 'mint':
        return 'Token Mint';
      default:
        return isOutgoing ? 'Send XARO' : 'Receive XARO';
    }
  };

  if (!walletAddress) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <History className="w-4 h-4 text-primary" />
            </div>
            <span>Transaction History</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Connect your wallet to view transaction history
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <History className="w-4 h-4 text-primary" />
            </div>
            <span>Transaction History</span>
          </CardTitle>
          <Button variant="ghost" size="sm" data-testid="button-view-all">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 rounded-full bg-muted animate-pulse"></div>
                  <div className="space-y-1">
                    <div className="w-24 h-4 bg-muted rounded animate-pulse"></div>
                    <div className="w-16 h-3 bg-muted rounded animate-pulse"></div>
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <div className="w-20 h-4 bg-muted rounded animate-pulse"></div>
                  <div className="w-16 h-3 bg-muted rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (transactions as Transaction[]).length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No transactions found
          </div>
        ) : (
          <div className="space-y-3" data-testid="transaction-list">
            {(transactions as Transaction[]).slice(0, 5).map((transaction: Transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                data-testid={`transaction-${transaction.id}`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 rounded-full bg-muted/50 flex items-center justify-center">
                    {getTransactionIcon(transaction)}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{getTransactionTitle(transaction)}</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {formatDistanceToNow(new Date(transaction.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-sm">
                    {getTransactionAmount(transaction)}
                  </p>
                  <p className={`text-xs capitalize ${getStatusColor(transaction.status)}`}>
                    {transaction.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
