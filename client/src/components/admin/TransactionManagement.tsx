import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Check, X, ArrowDownCircle, ArrowUpCircle, Loader2, Search } from 'lucide-react';
import { useState } from 'react';

type TxType = 'DEPOSIT' | 'WITHDRAWAL';
type TxStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

interface Transaction {
  id: string;
  user: { id: string; username: string };
  amount: number;
  type: TxType;
  walletAddress?: string;
  status: TxStatus;
  createdAt: string;
  proofImage?: string;
}

export function TransactionManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<TxType | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<TxStatus | 'ALL'>('PENDING');
  const queryClient = useQueryClient();

  // Fetch transactions
  const { data: transactions = [], isLoading } = useQuery<Transaction[]>({
    queryKey: ['adminTransactions'],
    queryFn: async () => {
      const response = await fetch('/api/admin/transactions');
      return response.json();
    },
  });

  // Update transaction status
  const updateStatus = useMutation({
    mutationFn: async ({ txId, status }: { txId: string; status: TxStatus }) => {
      const response = await fetch(`/api/admin/transactions/${txId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminTransactions'] });
      toast.success('Transaction status updated');
    },
    onError: () => {
      toast.error('Failed to update transaction status');
    },
  });

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch = tx.user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.walletAddress?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'ALL' || tx.type === typeFilter;
    const matchesStatus = statusFilter === 'ALL' || tx.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <h2 className="text-2xl font-bold">Transaction Management</h2>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search transactions..."
              className="w-full sm:w-64 pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="bg-background border rounded-md px-3 py-2 text-sm"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as TxType | 'ALL')}
          >
            <option value="ALL">All Types</option>
            <option value="DEPOSIT">Deposits</option>
            <option value="WITHDRAWAL">Withdrawals</option>
          </select>
          <select
            className="bg-background border rounded-md px-3 py-2 text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as TxStatus | 'ALL')}
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Wallet Address</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="font-medium">{tx.user.username}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {tx.type === 'DEPOSIT' ? (
                        <ArrowDownCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <ArrowUpCircle className="h-4 w-4 text-red-500" />
                      )}
                      {tx.type}
                    </div>
                  </TableCell>
                  <TableCell>${tx.amount.toFixed(2)}</TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {tx.walletAddress || 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        tx.status === 'APPROVED'
                          ? 'default'
                          : tx.status === 'REJECTED'
                          ? 'destructive'
                          : 'outline'
                      }
                    >
                      {tx.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(tx.createdAt).toLocaleString()}</TableCell>
                  <TableCell className="flex justify-end space-x-2">
                    {tx.status === 'PENDING' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8"
                          onClick={() => updateStatus.mutate({ txId: tx.id, status: 'APPROVED' })}
                          disabled={updateStatus.isPending}
                        >
                          {updateStatus.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4 mr-1" />
                          )}
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8"
                          onClick={() => updateStatus.mutate({ txId: tx.id, status: 'REJECTED' })}
                          disabled={updateStatus.isPending}
                        >
                          {updateStatus.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <X className="h-4 w-4 mr-1" />
                          )}
                          Reject
                        </Button>
                      </>
                    )}
                    {tx.proofImage && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8"
                        onClick={() => window.open(tx.proofImage, '_blank')}
                      >
                        View Proof
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
