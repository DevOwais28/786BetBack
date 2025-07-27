import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentService } from '@/services/payment.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { AlertCircle, CheckCircle2, XCircle, Clock, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const DepositProofCard = ({ proof, onApprove, onReject, isUpdating }: {
  proof: any;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
  isUpdating: boolean;
}) => {
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const { toast } = useToast();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500 hover:bg-green-600">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <Card key={proof._id} className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="font-medium">{proof.user?.username || 'Unknown User'}</h3>
              <span className="text-muted-foreground text-sm">
                ({proof.user?.email || 'No email'})
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="font-semibold">${proof.amount?.toFixed(2) || '0.00'}</span>
              <span className="text-muted-foreground text-sm">via {proof.paymentMethod || 'N/A'}</span>
              {getStatusBadge(proof.status || 'pending')}
            </div>
            
            <div className="text-sm text-muted-foreground">
              {proof.createdAt ? format(new Date(proof.createdAt), 'MMM d, yyyy h:mm a') : 'Unknown date'}
            </div>
            
            {proof.referenceNumber && (
              <div className="text-sm">
                <span className="text-muted-foreground">Reference:</span>{' '}
                <span className="font-mono">{proof.referenceNumber}</span>
              </div>
            )}
            
            {proof.reason && proof.status === 'rejected' && (
              <div className="text-sm text-red-500">
                <span className="font-medium">Reason:</span> {proof.reason}
              </div>
            )}
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8"
              onClick={() => setShowImageModal(true)}
            >
              View Proof
            </Button>
            
            {proof.status === 'pending' && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="h-8 bg-green-600 hover:bg-green-700"
                  onClick={() => onApprove(proof._id)}
                  disabled={isUpdating}
                >
                  {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Approve'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={() => setShowRejectDialog(true)}
                  disabled={isUpdating}
                >
                  Reject
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      
      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Deposit Proof</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this deposit proof.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for rejection</Label>
              <Input
                id="reason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter reason for rejection"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRejectDialog(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (!rejectReason.trim()) {
                  toast({
                    title: 'Error',
                    description: 'Please provide a reason for rejection',
                    variant: 'destructive',
                  });
                  return;
                }
                onReject(proof._id, rejectReason);
                setShowRejectDialog(false);
                setRejectReason('');
              }}
              disabled={isUpdating || !rejectReason.trim()}
            >
              {isUpdating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Reject Deposit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Image Modal */}
      <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Payment Proof</DialogTitle>
          </DialogHeader>
          <div className="relative">
            <img
              src={proof.screenshot}
              alt="Payment proof"
              className="w-full h-auto rounded-md"
            />
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export function DepositManagement() {
  const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch deposit proofs
  const {
    data: depositProofs = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['adminDepositProofs', statusFilter],
    queryFn: () => {
      const status = statusFilter === 'all' ? undefined : statusFilter;
      return paymentService.getDepositProofs(status);
    },
  });

  // Mutation to update proof status
  const updateStatusMutation = useMutation({
    mutationFn: ({ proofId, data }: { proofId: string; data: { status: 'approved' | 'rejected'; reason?: string } }) =>
      paymentService.updateProofStatus(proofId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminDepositProofs'] });
      toast({
        title: 'Success',
        description: 'Deposit status updated successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update deposit status',
        variant: 'destructive',
      });
    },
  });

  // Handle approve deposit
  const approveDeposit = (proofId: string) => {
    updateStatusMutation.mutate({
      proofId,
      data: { status: 'approved' },
    });
  };

  // Handle reject deposit
  const rejectDeposit = (proofId: string, reason: string) => {
    if (!reason) {
      toast({
        title: 'Error',
        description: 'Please provide a reason for rejection',
        variant: 'destructive',
      });
      return;
    }
    updateStatusMutation.mutate({
      proofId,
      data: { status: 'rejected', reason },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">Deposit Management</h2>
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm"
          >
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="all">All</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
          <p className="text-red-500">Error loading deposit proofs. Please try again.</p>
        </div>
      ) : depositProofs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Clock className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No deposit proofs found</h3>
          <p className="text-muted-foreground">
            {statusFilter === 'pending'
              ? 'No pending deposits to review.'
              : `No ${statusFilter} deposits found.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {depositProofs.map((proof: any) => (
            <DepositProofCard
              key={proof._id}
              proof={proof}
              onApprove={approveDeposit}
              onReject={rejectDeposit}
              isUpdating={updateStatusMutation.isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}
