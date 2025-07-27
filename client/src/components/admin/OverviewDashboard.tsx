import { Users, Activity, ArrowDownCircle, ArrowUpCircle, Clock, BarChart2, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface OverviewDashboardProps {
  stats: {
    totalUsers: number;
    activeUsers: number;
    totalDeposits: number;
    totalWithdrawals: number;
    pendingDeposits: number;
    pendingWithdrawals: number;
    dailyProfit: number;
    weeklyProfit: number;
    monthlyProfit: number;
    totalWagered: number;
    activeGames: number;
  };
}

export function OverviewDashboard({ stats }: OverviewDashboardProps) {
  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    color, 
    trend, 
    trendText 
  }: { 
    title: string; 
    value: string | number; 
    icon: any; 
    color: string; 
    trend?: number; 
    trendText?: string; 
  }) => (
    <Card className={`bg-gradient-to-br ${color} p-6`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm">{title}</p>
          <h3 className="text-2xl font-bold">{value}</h3>
          {trend !== undefined && trendText && (
            <div className="flex items-center mt-1 text-xs">
              <TrendingUp className="h-3 w-3 mr-1" />
              <span>{trendText}</span>
            </div>
          )}
        </div>
        <Icon className="h-8 w-8 opacity-50" />
      </div>
    </Card>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <StatCard
        title="Total Users"
        value={stats.totalUsers}
        icon={Users}
        color="from-blue-500/10 to-blue-600/10 border-blue-500/20"
      />
      
      <StatCard
        title="Active Users (24h)"
        value={stats.activeUsers}
        icon={Activity}
        color="from-green-500/10 to-green-600/10 border-green-500/20"
      />
      
      <StatCard
        title="Active Games"
        value={stats.activeGames}
        icon={BarChart2}
        color="from-purple-500/10 to-purple-600/10 border-purple-500/20"
      />
      
      <StatCard
        title="Total Deposits"
        value={`$${stats.totalDeposits?.toLocaleString()}`}
        icon={ArrowDownCircle}
        color="from-indigo-500/10 to-indigo-600/10 border-indigo-500/20"
      />
      
      <StatCard
        title="Total Withdrawals"
        value={`$${stats.totalWithdrawals?.toLocaleString()}`}
        icon={ArrowUpCircle}
        color="from-rose-500/10 to-rose-600/10 border-rose-500/20"
      />
      
      <StatCard
        title="24h Profit"
        value={`$${stats.dailyProfit?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        icon={BarChart2}
        color="from-emerald-500/10 to-emerald-600/10 border-emerald-500/20"
        trend={stats.dailyProfit / (stats.totalWagered || 1) * 100}
        trendText={`${(stats.dailyProfit / (stats.totalWagered || 1) * 100).toFixed(2)}% from $${stats.totalWagered?.toLocaleString()} wagered`}
      />
      
      <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard
          title="Pending Deposits"
          value={stats.pendingDeposits}
          icon={Clock}
          color="from-amber-500/10 to-amber-600/10 border-amber-500/20"
        />
        
        <StatCard
          title="Pending Withdrawals"
          value={stats.pendingWithdrawals}
          icon={Clock}
          color="from-orange-500/10 to-orange-600/10 border-orange-500/20"
        />
      </div>
      
      <StatCard
        title="7d Profit"
        value={`$${stats.weeklyProfit?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        icon={BarChart2}
        color="from-violet-500/10 to-violet-600/10 border-violet-500/20"
      />
    </div>
  );
}
