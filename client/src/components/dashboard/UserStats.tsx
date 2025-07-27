import React from 'react';
import { TrendingUp, TrendingDown, Users, DollarSign, Gamepad2, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface UserStatsProps {
  balance: number;
  totalWinnings: number;
  gamesPlayed: number;
  referralEarnings: number;
  totalReferrals: number;
  activeReferrals: number;
  weeklyChange?: {
    balance: number;
    winnings: number;
    games: number;
    referrals: number;
  };
}

export function UserStats({ 
  balance, 
  totalWinnings, 
  gamesPlayed, 
  referralEarnings, 
  totalReferrals, 
  activeReferrals,
  weeklyChange 
}: UserStatsProps) {
  const stats = [
    {
      title: 'Total Balance',
      value: `$${balance?.toLocaleString() || '0'}`,
      icon: DollarSign,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      trend: weeklyChange?.balance || 0,
      trendColor: weeklyChange?.balance && weeklyChange.balance > 0 ? 'text-green-400' : 'text-red-400'
    },
    {
      title: 'Total Winnings',
      value: `$${totalWinnings?.toLocaleString() || '0'}`,
      icon: Trophy,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
      trend: weeklyChange?.winnings || 0,
      trendColor: weeklyChange?.winnings && weeklyChange.winnings > 0 ? 'text-green-400' : 'text-red-400'
    },
    {
      title: 'Games Played',
      value: gamesPlayed?.toString() || '0',
      icon: Gamepad2,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      trend: weeklyChange?.games || 0,
      trendColor: weeklyChange?.games && weeklyChange.games > 0 ? 'text-green-400' : 'text-red-400'
    },
    {
      title: 'Referral Earnings',
      value: `$${referralEarnings?.toLocaleString() || '0'}`,
      icon: Users,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      trend: weeklyChange?.referrals || 0,
      trendColor: weeklyChange?.referrals && weeklyChange.referrals > 0 ? 'text-green-400' : 'text-red-400'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white mb-1">
              {stat.value}
            </div>
            {stat.trend !== 0 && (
              <div className="flex items-center space-x-1">
                {stat.trend > 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-400" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-400" />
                )}
                <span className={`text-xs font-medium ${stat.trendColor}`}>
                  {stat.trend > 0 ? '+' : ''}{stat.trend}%
                </span>
                <span className="text-xs text-slate-400">vs last week</span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
