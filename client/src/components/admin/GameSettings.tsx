import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Play, Pause, RefreshCw } from 'lucide-react';
import { useState } from 'react';

interface GameState {
  enabled: boolean;
  minBet: number;
  maxBet: number;
  houseEdge: number;
  crashProbability: number;
  roundDuration: number;
}

interface Analytics {
  dailyProfit: number;
  weeklyProfit: number;
  monthlyProfit: number;
  activeUsers: number;
  totalUsers: number;
  totalBets: number;
  totalWagered: number;
}

export function GameSettings() {
  const queryClient = useQueryClient();
  const [localGameState, setLocalGameState] = useState<Partial<GameState>>({});

  // Fetch game state
  const { data: gameState, isLoading: isLoadingState } = useQuery<GameState>({
    queryKey: ['gameState'],
    queryFn: async () => {
      const response = await fetch('/api/admin/game/state');
      return response.json();
    },
    onSuccess: (data) => {
      setLocalGameState(data);
    },
  });

  // Fetch analytics
  const { data: analytics, isLoading: isLoadingAnalytics } = useQuery<Analytics>({
    queryKey: ['analytics'],
    queryFn: async () => {
      const response = await fetch('/api/admin/analytics');
      return response.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Update game state
  const updateGameState = useMutation({
    mutationFn: async (updates: Partial<GameState>) => {
      const response = await fetch('/api/admin/game/state', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gameState'] });
      toast.success('Game settings updated');
    },
    onError: () => {
      toast.error('Failed to update game settings');
    },
  });

  // Toggle game state
  const toggleGame = () => {
    if (!gameState) return;
    updateGameState.mutate({ enabled: !gameState.enabled });
  };

  // Handle input changes
  const handleChange = (field: keyof GameState, value: any) => {
    setLocalGameState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Save settings
  const saveSettings = () => {
    updateGameState.mutate(localGameState);
  };

  // Reset round (if applicable)
  const resetRound = async () => {
    try {
      await fetch('/api/admin/game/reset', { method: 'POST' });
      toast.success('Game round reset');
    } catch (error) {
      toast.error('Failed to reset game round');
    }
  };

  if (isLoadingState || isLoadingAnalytics || !gameState) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Game Controls */}
      <div className="bg-card p-6 rounded-lg border">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Game Controls</h2>
          <div className="flex items-center space-x-4">
            <Button
              variant={gameState.enabled ? 'destructive' : 'default'}
              onClick={toggleGame}
              disabled={updateGameState.isPending}
              className="flex items-center gap-2"
            >
              {updateGameState.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : gameState.enabled ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              {gameState.enabled ? 'Pause Game' : 'Resume Game'}
            </Button>
            <Button
              variant="outline"
              onClick={resetRound}
              disabled={updateGameState.isPending}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset Round
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Game Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="minBet">Minimum Bet</Label>
                <div className="flex items-center gap-2">
                  <span>$</span>
                  <Input
                    id="minBet"
                    type="number"
                    value={localGameState.minBet ?? ''}
                    onChange={(e) => handleChange('minBet', parseFloat(e.target.value) || 0)}
                    className="w-32"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="maxBet">Maximum Bet</Label>
                <div className="flex items-center gap-2">
                  <span>$</span>
                  <Input
                    id="maxBet"
                    type="number"
                    value={localGameState.maxBet ?? ''}
                    onChange={(e) => handleChange('maxBet', parseFloat(e.target.value) || 0)}
                    className="w-32"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="houseEdge">House Edge (%)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="houseEdge"
                    type="number"
                    step="0.1"
                    value={((localGameState.houseEdge ?? 0) * 100).toFixed(1)}
                    onChange={(e) =>
                      handleChange('houseEdge', (parseFloat(e.target.value) || 0) / 100)
                    }
                    className="w-32"
                  />
                  <span>%</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="crashProbability">Crash Probability</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="crashProbability"
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={localGameState.crashProbability ?? ''}
                    onChange={(e) =>
                      handleChange('crashProbability', parseFloat(e.target.value) || 0)
                    }
                    className="w-32"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="roundDuration">Round Duration (ms)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="roundDuration"
                    type="number"
                    value={localGameState.roundDuration ?? ''}
                    onChange={(e) =>
                      handleChange('roundDuration', parseInt(e.target.value) || 0)
                    }
                    className="w-32"
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button
                  onClick={saveSettings}
                  disabled={updateGameState.isPending}
                  className="w-full sm:w-auto"
                >
                  {updateGameState.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Settings'
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Analytics */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Analytics</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Daily Profit</p>
                <p className="text-2xl font-bold">
                  ${analytics?.dailyProfit?.toFixed(2) || '0.00'}
                </p>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Weekly Profit</p>
                <p className="text-2xl font-bold">
                  ${analytics?.weeklyProfit?.toFixed(2) || '0.00'}
                </p>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Monthly Profit</p>
                <p className="text-2xl font-bold">
                  ${analytics?.monthlyProfit?.toFixed(2) || '0.00'}
                </p>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">{analytics?.activeUsers || '0'}</p>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{analytics?.totalUsers || '0'}</p>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Total Wagered</p>
                <p className="text-2xl font-bold">
                  ${analytics?.totalWagered?.toFixed(2) || '0.00'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
