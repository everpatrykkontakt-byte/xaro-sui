import { useState } from "react";
import { Send, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWallet } from "@/hooks/use-wallet";
import { useSuiClient } from "@/hooks/use-sui-client";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface Reward {
  id: string;
  amount: string;
  walletAddress: string;
  userId: string;
  reason: string;
  claimed: boolean;
  claimedAt: Date | null;
  createdAt: Date;
}

interface RewardClaimMutation {
  walletAddress: string;
}

export function TokenTransfer() {
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState("");
  const { walletConnected, walletAddress } = useWallet();
  const { transferTokens } = useSuiClient();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch unclaimed rewards
  const { data: rewards = [] } = useQuery({
    queryKey: ["/api/rewards", walletAddress],
    enabled: !!walletAddress,
  });

  const totalRewards = (rewards as Reward[]).reduce((sum: number, reward: Reward) => sum + parseFloat(reward.amount), 0);

  // Transfer mutation
  const transferMutation = useMutation({
    mutationFn: async ({ to, amount }: { to: string; amount: string }) => {
      if (!walletAddress) throw new Error("Wallet not connected");
      
      const result = await transferTokens(to, amount);
      
      // Record transaction in backend
      await apiRequest("POST", "/api/transactions", {
        txHash: result.txHash,
        transactionCode: result.transactionCode,
        fromAddress: walletAddress,
        toAddress: to,
        amount: amount,
        type: "transfer",
        status: "pending",
      });

      return result;
    },
    onSuccess: (data) => {
      toast({
        title: "Transfer Successful!",
        description: `Successfully sent ${amount} XARO tokens`,
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      setRecipientAddress("");
      setAmount("");
    },
    onError: (error) => {
      toast({
        title: "Transfer Failed",
        description: error.message || "Failed to send tokens. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Claim rewards mutation
  const claimRewardsMutation = useMutation({
    mutationFn: async () => {
      if (!walletAddress) throw new Error("Wallet not connected");
      
      const claimPromises = (rewards as Reward[]).map((reward: Reward) =>
        apiRequest("POST", `/api/rewards/${reward.id}/claim`, {})
      );
      
      await Promise.all(claimPromises);
      return { amount: totalRewards };
    },
    onSuccess: (data) => {
      toast({
        title: "Rewards Claimed!",
        description: `Successfully claimed ${data.amount.toFixed(2)} XARO tokens`,
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/rewards"] });
    },
    onError: (error) => {
      toast({
        title: "Claim Failed",
        description: "Failed to claim rewards. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!walletConnected) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    if (!recipientAddress || !amount) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Amount must be greater than 0",
        variant: "destructive",
      });
      return;
    }

    if (!recipientAddress.startsWith('0x') || recipientAddress.length < 66) {
      toast({
        title: "Invalid Address",
        description: "Please enter a valid Sui address",
        variant: "destructive",
      });
      return;
    }

    transferMutation.mutate({ to: recipientAddress, amount });
  };

  const handleClaimRewards = () => {
    if (!walletConnected) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    if (totalRewards <= 0) {
      toast({
        title: "No Rewards",
        description: "You have no unclaimed rewards available",
        variant: "destructive",
      });
      return;
    }

    claimRewardsMutation.mutate();
  };

  return (
    <div className="space-y-6">
      {/* Token Transfer */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Send className="w-4 h-4 text-primary" />
            </div>
            <span>Send XARO Tokens</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleTransfer} className="space-y-4">
            <div>
              <Label htmlFor="recipient">Recipient Address</Label>
              <Input
                id="recipient"
                placeholder="0x..."
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                className="font-mono text-sm"
                data-testid="input-recipient"
              />
            </div>

            <div>
              <Label htmlFor="amount">Amount</Label>
              <div className="relative">
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.0"
                  min="0"
                  step="0.000001"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pr-16"
                  data-testid="input-amount"
                />
                <span className="absolute right-3 top-2 text-sm text-muted-foreground font-medium">
                  XARO
                </span>
              </div>
            </div>

            <div className="bg-muted rounded-lg p-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Network Fee</span>
                <span>~0.001 SUI</span>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={!walletConnected || transferMutation.isPending}
              data-testid="button-send-tokens"
            >
              {transferMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Tokens
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Reward Claim */}
      <Card className="transaction-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
              <Gift className="w-4 h-4 text-green-500" />
            </div>
            <div>
              <span>Claim Rewards</span>
              <p className="text-sm text-muted-foreground font-normal">
                Earn XARO for contributing fixes
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Available Rewards</span>
              <span className="font-semibold text-green-500" data-testid="text-available-rewards">
                {totalRewards.toFixed(2)} XARO
              </span>
            </div>
          </div>

          <Button
            onClick={handleClaimRewards}
            className="w-full bg-green-500 hover:bg-green-600"
            disabled={!walletConnected || totalRewards <= 0 || claimRewardsMutation.isPending}
            data-testid="button-claim-rewards"
          >
            {claimRewardsMutation.isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                Claiming...
              </>
            ) : (
              <>
                <Gift className="w-4 h-4 mr-2" />
                Claim Rewards
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
