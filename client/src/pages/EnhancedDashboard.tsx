import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { 
  Wallet, 
  TrendingUp, 
  Gamepad2, 
  Copy, 
  Plus, 
  Minus, 
  Menu, 
  X, 
  Trophy,
  Users,
  Clock,
  DollarSign,
  BarChart3,
  Gift,
  Settings,
  LogOut,
  ChevronRight,
  Activity,
  Zap,
  Target,
  Star,
  ArrowDownCircle,
  ArrowUpCircle,
  Shield,
  Bell,
  User
} from 'lucide-react';
import { Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Button 
} from '@/components/ui/button';
import { 
  Progress 
} from '@/components/ui/progress';
import { 
  Badge 
} from '@/components/ui/badge';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Avatar, 
  AvatarFallback, 
  AvatarImage 
} from '@/components/ui/avatar';
import { 
  Skeleton 
} from '@/components/ui/skeleton';

interface UserProfile {
  username: string;
  balance: number;
  referralCode?: string;
  totalWinnings: number;
  gamesPlayed: number;
  referralEarnings: number;
  totalReferrals: number;
  activeReferrals: number;
  avatar?: string;
  level: number;
  experience: number;
  nextLevelExp: number;
  achievements: Achievement[];
  recentActivity: Activity[];
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
}

interface Activity {
  id: string;
  type: 'game' | 'deposit' | 'withdrawal' | 'referral';
  description: string;
  amount?: number;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
}

interface GameHistory {
  id: string;
  game: string;
  betAmount: number;
  multiplier: number;
  profit: number;
  timestamp: string;
  status: 'win' | 'loss';
}

export default function EnhancedDashboard() {
  const [location, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const { toast } = useToast();

  const { data: userData, isLoading: profileLoading } = useQuery<any>({
    queryKey: ['/api/profile/me'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: gameHistory, isLoading: historyLoading } = useQuery<GameHistory[]>({
    queryKey: ['/api/bets/history'],
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const { data: stats } = useQuery({
    queryKey: ['/api/user/stats'],
    staleTime: 30 * 1000, // 30 seconds
  });

  useEffect(() => {
    if (userData?.data?.experience >= userData?.data?.nextLevelExp) {
      setShowLevelUp(true);
      setTimeout(() => setShowLevelUp(false), 3000);
    }
  }, [userData]);

  const copyReferralCode = () => {
    if (userData?.data?.referralCode) {
      navigator.clipboard.writeText(userData.data.referralCode);
      toast({
        title: "🎉 Referral Code Copied!",
        description: "Share with friends to earn rewards",
        duration: 3000,
      });
    }
  };

  const QuickActionButton = ({ icon: Icon, label, onClick, color = "primary" }: any) => (
    <Button
      onClick={onClick}
      className={`flex flex-col items-center justify-center h-24 w-full rounded-xl border-2 bg-gradient-to-br hover:shadow-lg transition-all duration-200 ${
        color === 'primary' 
          ? 'from-blue-500 to-purple-600 border-blue-400 hover:from-blue-600 hover:to-purple-700' 
          : color === 'success'
          ? 'from-green-500 to-emerald-600 border-green-400 hover:from-green-600 hover:to-emerald-700'
          : 'from-orange-500 to-red-600 border-orange-400 hover:from-orange-600 hover:to-red-700'
      }`}
    >
      <Icon className="w-6 h-6 mb-2" />
      <span className="text-xs font-medium">{label}</span>
    </Button>
  );

  const StatCard = ({ title, value, icon: Icon, trend, color }: any) => (
    <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-300">{title}</CardTitle>
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="w-4 h-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-white">{value}</div>
        {trend && (
          <p className="text-xs text-slate-400 mt-1">
            <span className={trend > 0 ? 'text-green-400' : 'text-red-400'}>
              {trend > 0 ? '+' : ''}{trend}%
            </span>
            from last week
          </p>
        )}
      </CardContent>
    </Card>
  );

  const LoadingSkeleton = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  if (profileLoading) return <LoadingSkeleton />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Level Up Animation */}
      {showLevelUp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-8 rounded-2xl text-center animate-pulse">
            <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Level Up!</h2>
            <p className="text-white/80">Congratulations! You've reached Level {userData?.data?.level}</p>
          </div>
        </div>
      )}

      <div className="flex h-screen">
        {/* Sidebar */}
        <aside className={`fixed lg:relative z-40 w-64 bg-slate-800/50 backdrop-blur-sm border-r border-slate-700 transition-transform duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-white">Dashboard</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <nav className="space-y-2">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'games', label: 'Games', icon: Gamepad2 },
                { id: 'wallet', label: 'Wallet', icon: Wallet },
                { id: 'referrals', label: 'Referrals', icon: Users },
                { id: 'achievements', label: 'Achievements', icon: Trophy },
                { id: 'settings', label: 'Settings', icon: Settings },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    activeTab === item.id
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                      : 'text-slate-300 hover:bg-slate-700/50'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {/* Header */}
          <header className="bg-slate-800/30 backdrop-blur-sm border-b border-slate-700">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden"
                >
                  <Menu className="w-5 h-5" />
                </Button>
                <h1 className="text-2xl font-bold text-white">Welcome back, {userData?.data?.username}</h1>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="hidden md:block text-right">
                  <p className="text-sm text-slate-400">Balance</p>
                  <p className="text-xl font-bold text-white">${userData?.data?.balance?.toLocaleString()}</p>
                </div>
                
                <Avatar>
                  <AvatarImage src={userData?.data?.avatar} />
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600">
                    {userData?.data?.username?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          </header>

          <div className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard
                    title="Total Balance"
                    value={`$${userData?.data?.balance?.toLocaleString() || '0'}`}
                    icon={Wallet}
                    trend={12.5}
                    color="bg-blue-500/20 text-blue-400"
                  />
                  <StatCard
                    title="Total Winnings"
                    value={`$${userData?.data?.totalWinnings?.toLocaleString() || '0'}`}
                    icon={Trophy}
                    trend={8.2}
                    color="bg-green-500/20 text-green-400"
                  />
                  <StatCard
                    title="Games Played"
                    value={userData?.data?.gamesPlayed?.toString() || '0'}
                    icon={Gamepad2}
                    trend={15.3}
                    color="bg-purple-500/20 text-purple-400"
                  />
                  <StatCard
                    title="Referral Earnings"
                    value={`$${userData?.data?.referralEarnings?.toLocaleString() || '0'}`}
                    icon={Users}
                    trend={25.7}
                    color="bg-orange-500/20 text-orange-400"
                  />
                </div>

                {/* Level Progress */}
                <Card className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-purple-500/30">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      Level {userData?.data?.level}
                    </CardTitle>
                    <CardDescription className="text-slate-300">
                      Progress to next level
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-300">Experience</span>
                        <span className="text-white font-medium">
                          {userData?.data?.experience || 0} / {userData?.data?.nextLevelExp || 100} XP
                        </span>
                      </div>
                      <Progress 
                        value={((userData?.data?.experience || 0) / (userData?.data?.nextLevelExp || 100)) * 100} 
                        className="h-2 bg-slate-700"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <QuickActionButton
                    icon={Plus}
                    label="Deposit"
                    onClick={() => handleQuickAction('deposit')}
                    color="success"
                  />
                  <QuickActionButton
                    icon={Minus}
                    label="Withdraw"
                    onClick={() => handleQuickAction('withdraw')}
                    color="primary"
                  />
                  <QuickActionButton
                    icon={Gamepad2}
                    label="Play Game"
                    onClick={() => handleQuickAction('play')}
                    color="orange"
                  />
                  <QuickActionButton
                    icon={Copy}
                    label="Refer Friends"
                    onClick={copyReferralCode}
                    color="purple"
                  />
                </div>

                {/* Recent Activity */}
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {userData?.data?.recentActivity?.slice(0, 5).map((activity: any) => (
                        <div key={activity.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700/70 transition-colors">
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-full ${
                              activity.type === 'game' ? 'bg-purple-500/20' :
                              activity.type === 'deposit' ? 'bg-green-500/20' :
                              activity.type === 'withdrawal' ? 'bg-red-500/20' :
                              'bg-blue-500/20'
                            }`}>
                              {activity.type === 'game' && <Gamepad2 className="w-4 h-4" />}
                              {activity.type === 'deposit' && <Plus className="w-4 h-4" />}
                              {activity.type === 'withdrawal' && <Minus className="w-4 h-4" />}
                              {activity.type === 'referral' && <Users className="w-4 h-4" />}
                            </div>
                            <div>
                              <p className="text-white font-medium">{activity.description}</p>
                              <p className="text-slate-400 text-sm">{activity.timestamp}</p>
                            </div>
                          </div>
                          {activity.amount && (
                            <span className={`font-bold ${
                              activity.type === 'game' && activity.status === 'completed' ? 'text-green-400' :
                              activity.type === 'deposit' ? 'text-green-400' :
                              'text-red-400'
                            }`}>
                              ${activity.amount}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Games Tab */}
              <TabsContent value="games" className="space-y-6">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Available Games</CardTitle>
                    <CardDescription className="text-slate-300">
                      Choose from our exciting game collection
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[
                        { name: 'Crash Game', icon: TrendingUp, color: 'from-red-500 to-pink-600', minBet: 0.1, maxBet: 100 },
                        { name: 'Dice Game', icon: Target, color: 'from-blue-500 to-cyan-600', minBet: 0.5, maxBet: 50 },
                        { name: 'Slots', icon: Star, color: 'from-yellow-500 to-orange-600', minBet: 0.2, maxBet: 25 },
                      ].map((game) => (
                        <Card key={game.name} className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 border-slate-600">
                          <CardContent className="p-6">
                            <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${game.color} mb-4 flex items-center justify-center`}>
                              <game.icon className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">{game.name}</h3>
                            <p className="text-slate-400 text-sm mb-4">
                              Min: ${game.minBet} - Max: ${game.maxBet}
                            </p>
                            <Button 
                              className={`w-full bg-gradient-to-r ${game.color} hover:opacity-90`}
                              onClick={() => toast({ title: `${game.name} coming soon!` })}
                            >
                              Play Now
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Wallet Tab */}
              <TabsContent value="wallet" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Deposit Funds
                      </Button>
                      <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                        <Minus className="w-4 h-4 mr-2" />
                        Withdraw Funds
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white">Transaction History</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8">
                        <Wallet className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                        <p className="text-slate-400">Your transaction history will appear here</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Referrals Tab */}
              <TabsContent value="referrals" className="space-y-6">
                <Card className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 border-purple-500/30">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Referral Program
                    </CardTitle>
                    <CardDescription className="text-slate-300">
                      Invite friends and earn 10% commission on their deposits
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="bg-slate-800/50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-white font-medium">Your Referral Code</span>
                        <Badge variant="secondary" className="bg-purple-500/20 text-purple-300">
                          {userData?.data?.totalReferrals} referrals
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-slate-700 rounded-lg p-3 font-mono text-white text-center">
                          {userData?.data?.referralCode || 'LOADING...'}
                        </div>
                        <Button
                          size="sm"
                          onClick={copyReferralCode}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="bg-slate-800/50 border-slate-700">
                        <CardContent className="p-4 text-center">
                          <Users className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                          <p className="text-2xl font-bold text-white">{userData?.data?.totalReferrals || 0}</p>
                          <p className="text-sm text-slate-400">Total Referrals</p>
                        </CardContent>
                      </Card>
                      <Card className="bg-slate-800/50 border-slate-700">
                        <CardContent className="p-4 text-center">
                          <DollarSign className="w-8 h-8 text-green-400 mx-auto mb-2" />
                          <p className="text-2xl font-bold text-white">${userData?.data?.referralEarnings?.toLocaleString() || 0}</p>
                          <p className="text-sm text-slate-400">Total Earned</p>
                        </CardContent>
                      </Card>
                      <Card className="bg-slate-800/50 border-slate-700">
                        <CardContent className="p-4 text-center">
                          <Activity className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                          <p className="text-2xl font-bold text-white">{userData?.data?.activeReferrals || 0}</p>
                          <p className="text-sm text-slate-400">Active Referrals</p>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Achievements Tab */}
              <TabsContent value="achievements" className="space-y-6">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Trophy className="w-5 h-5" />
                      Achievements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {userData?.data?.achievements?.map((achievement: any) => (
                        <Card key={achievement.id} className={`border-2 ${
                          achievement.unlocked 
                            ? 'border-yellow-500/50 bg-yellow-500/10' 
                            : 'border-slate-600 bg-slate-800/50'
                        }`}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h4 className="font-bold text-white">{achievement.title}</h4>
                                <p className="text-sm text-slate-400">{achievement.description}</p>
                              </div>
                              <div className={`p-2 rounded-lg ${
                                achievement.unlocked ? 'bg-yellow-500/20' : 'bg-slate-700'
                              }`}>
                                <Trophy className={`w-5 h-5 ${
                                  achievement.unlocked ? 'text-yellow-400' : 'text-slate-400'
                                }`} />
                              </div>
                            </div>
                            <Progress value={(achievement.progress / achievement.maxProgress) * 100} className="h-2" />
                            <p className="text-xs text-slate-400 mt-2">
                              {achievement.progress} / {achievement.maxProgress}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
