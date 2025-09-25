import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, ExternalLink } from "lucide-react";

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction?: {
    hash: string;
    code: string;
    status: 'processing' | 'success' | 'error';
    type: string;
    amount?: string;
  };
}

export function TransactionModal({ isOpen, onClose, transaction }: TransactionModalProps) {
  const [currentStatus, setCurrentStatus] = useState<'processing' | 'success' | 'error'>('processing');

  useEffect(() => {
    if (transaction?.status) {
      setCurrentStatus(transaction.status);
    }
  }, [transaction?.status]);

  const getIcon = () => {
    switch (currentStatus) {
      case 'success':
        return <CheckCircle className="w-16 h-16 text-green-500" />;
      case 'error':
        return <XCircle className="w-16 h-16 text-red-500" />;
      default:
        return (
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        );
    }
  };

  const getTitle = () => {
    switch (currentStatus) {
      case 'success':
        return 'Transaction Successful';
      case 'error':
        return 'Transaction Failed';
      default:
        return 'Processing Transaction';
    }
  };

  const getDescription = () => {
    switch (currentStatus) {
      case 'success':
        return 'Your transaction has been completed successfully.';
      case 'error':
        return 'Your transaction could not be processed. Please try again.';
      default:
        return 'Please wait while your transaction is being processed...';
    }
  };

  const handleViewExplorer = () => {
    if (transaction?.hash) {
      // Open Sui explorer with transaction hash
      window.open(`https://suiexplorer.com/txblock/${transaction.hash}`, '_blank');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md" data-testid="transaction-modal">
        <DialogHeader>
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              {getIcon()}
            </div>
            <DialogTitle className="text-lg font-semibold mb-2">
              {getTitle()}
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              {getDescription()}
            </p>
          </div>
        </DialogHeader>

        {currentStatus !== 'processing' && transaction && (
          <div className="space-y-3 mb-6">
            <div className="bg-muted rounded-lg p-3">
              <p className="text-sm text-muted-foreground mb-1">Transaction Code</p>
              <p className="font-mono text-xs break-all" data-testid="text-transaction-code">
                {transaction.code}
              </p>
            </div>
            
            <div className="bg-muted rounded-lg p-3">
              <p className="text-sm text-muted-foreground mb-1">Transaction Hash</p>
              <p className="font-mono text-xs break-all" data-testid="text-transaction-hash">
                {transaction.hash}
              </p>
            </div>
          </div>
        )}

        <DialogFooter className="flex space-x-3">
          <Button variant="outline" onClick={onClose} data-testid="button-modal-close">
            Close
          </Button>
          
          {currentStatus === 'success' && transaction?.hash && (
            <Button onClick={handleViewExplorer} data-testid="button-view-explorer">
              <ExternalLink className="w-4 h-4 mr-2" />
              View on Explorer
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Default export with state management for easier use
export default function TransactionModalManager() {
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    transaction?: {
      hash: string;
      code: string;
      status: 'processing' | 'success' | 'error';
      type: string;
      amount?: string;
    };
  }>({ isOpen: false });

  // This would be called from other components via a context or event system
  // For now, it's just a placeholder component
  return (
    <TransactionModal
      isOpen={modalState.isOpen}
      onClose={() => setModalState({ isOpen: false })}
      transaction={modalState.transaction}
    />
  );
}
