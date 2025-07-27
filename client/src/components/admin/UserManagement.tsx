import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2, UserMinus, UserPlus, Search } from 'lucide-react';
import { useState } from 'react';

interface User {
  id: string;
  username: string;
  email: string;
  balance: number;
  isBanned: boolean;
  lastLogin?: string;
}

export function UserManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  // Fetch users
  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ['adminUsers'],
    queryFn: async () => {
      const response = await fetch('/api/admin/users');
      return response.json();
    },
  });

  // Toggle user ban status
  const toggleBan = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`/api/admin/users/${userId}/ban`, {
        method: 'PATCH',
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      toast.success('User status updated');
    },
    onError: () => {
      toast.error('Failed to update user status');
    },
  });

  // Update user balance
  const updateBalance = useMutation({
    mutationFn: async ({ userId, amount }: { userId: string; amount: number }) => {
      const response = await fetch(`/api/admin/users/${userId}/balance`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      toast.success('Balance updated');
    },
    onError: () => {
      toast.error('Failed to update balance');
    },
  });

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">User Management</h2>
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search users..."
            className="w-full bg-background pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
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
                <TableHead>Email</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>${user.balance.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={user.isBanned ? 'destructive' : 'default'}>
                      {user.isBanned ? 'Banned' : 'Active'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                  </TableCell>
                  <TableCell className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const amount = prompt('Enter amount to adjust:');
                        if (amount && !isNaN(Number(amount))) {
                          updateBalance.mutate({ userId: user.id, amount: Number(amount) });
                        }
                      }}
                    >
                      Adjust Balance
                    </Button>
                    <Button
                      variant={user.isBanned ? 'default' : 'destructive'}
                      size="sm"
                      onClick={() => toggleBan.mutate(user.id)}
                      disabled={toggleBan.isPending}
                    >
                      {toggleBan.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : user.isBanned ? (
                        <UserPlus className="h-4 w-4 mr-2" />
                      ) : (
                        <UserMinus className="h-4 w-4 mr-2" />
                      )}
                      {user.isBanned ? 'Unban' : 'Ban'}
                    </Button>
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
