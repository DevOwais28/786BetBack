import React from 'react';
import { TrendingUp, Target, Star, Clock, Users } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface GameCardProps {
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  gradient: string;
  minBet: number;
  maxBet: number;
  playersOnline: number;
  houseEdge: number;
  rtp: number;
  isHot?: boolean;
  isNew?: boolean;
  onPlay: () => void;
  stats?: {
    totalBets: number;
    totalWinnings: number;
    biggestWin: number;
  };
}

export function GameCard({
  name,
  description,
  icon: Icon,
  color,
  gradient,
  minBet,
  maxBet,
  playersOnline,
  houseEdge,
  rtp,
  isHot,
  isNew,
  onPlay,
  stats
}: GameCardProps) {
  return (
    <Card className={`bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-all duration-300 group hover:scale-105`}>
      <div className="relative overflow-hidden">
        {/* Background Gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-10 group-hover:opacity-20 transition-opacity duration-300`} />
        
        {/* Badges */}
        <div className="absolute top-4 right-4 flex space-x-2">
          {isHot && (
            <Badge className="bg-red-500/20 text-red-300 border-red-500/30">
              <TrendingUp className="w-3 h-3 mr-1" />
              Hot
            </Badge>
          )}
          {isNew && (
            <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
              New
            </Badge>
          )}
        </div>

        <CardHeader className="relative z-10">
          <div className="flex items-center space-x-4">
            <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
              <Icon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{name}</h3>
              <p className="text-sm text-slate-400">{description}</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative z-10 space-y-4">
          {/* Game Stats */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-400">Min Bet</span>
              <p className="text-white font-semibold">${minBet}</p>
            </div>
            <div>
              <span className="text-slate-400">Max Bet</span>
              <p className="text-white font-semibold">${maxBet}</p>
            </div>
          </div>

          {/* Online Players */}
          <div className="flex items-center space-x-2 text-sm">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <Users className="w-4 h-4 text-slate-400" />
            </div>
            <span className="text-slate-400">{playersOnline} online</span>
          </div>

          {/* RTP Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">RTP</span>
              <span className="text-white font-medium">{rtp}%</span>
            </div>
            <Progress value={rtp} className="h-2 bg-slate-700" />
          </div>

          {/* Game Stats */}
          {stats && (
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-center">
                <p className="text-slate-400">Total Bets</p>
                <p className="text-white font-medium">${stats.totalBets.toLocaleString()}</p>
              </div>
              <div className="text-center">
                <p className="text-slate-400">Winnings</p>
                <p className="text-green-400 font-medium">${stats.totalWinnings.toLocaleString()}</p>
              </div>
              <div className="text-center">
                <p className="text-slate-400">Biggest</p>
                <p className="text-yellow-400 font-medium">${stats.biggestWin.toLocaleString()}</p>
              </div>
            </div>
          )}

          {/* Play Button */}
          <Button 
            className={`w-full bg-gradient-to-r ${gradient} hover:opacity-90 text-white font-semibold py-3`}
            onClick={onPlay}
          >
            Play Now
            <TrendingUp className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </div>
    </Card>
  );
}
