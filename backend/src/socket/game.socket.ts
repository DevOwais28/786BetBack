import { Server } from 'socket.io';
import http from 'http';
import Round from '../models/Round';
import Bet from '../models/Bet';
import User from '../models/User';
import { randomCrash } from '../utils/crashLogic';

export const initGame = (server: http.Server) => {
  const io = new Server(server, { cors: { origin: '*' } });

  let currentRound: number = 1;
  let gameState: 'waiting' | 'running' | 'ended' = 'waiting';
  let crashPoint: number;

  const startRound = async () => {
    crashPoint = randomCrash(); // provably-fair
    await Round.create({ roundId: currentRound, crashPoint });
    io.emit('roundStart', { roundId: currentRound, crashPoint });
    gameState = 'running';

    setTimeout(async () => {
      gameState = 'ended';
      await Round.updateOne({ roundId: currentRound }, { status: 'ended' });
      io.emit('roundEnd', { roundId: currentRound, crashPoint });

      // settle bets
      const bets = await Bet.find({ round: currentRound });
      for (const bet of bets) {
        if (!bet.cashOutAt || bet.cashOutAt > crashPoint) {
          // lost
        } else {
          const profit = bet.amount * bet.multiplier!;
          await User.findByIdAndUpdate(bet.user, { $inc: { balance: profit } });
        }
      }
      currentRound++;
      setTimeout(startRound, 5000); // next round
    }, crashPoint * 1000);
  };

  io.on('connection', (socket) => {
    socket.on('placeBet', async ({ amount, round }) => {
      if (gameState !== 'waiting') return socket.emit('error', 'Late');
      await Bet.create({ user: socket.handshake.auth.userId, amount, round });
    });

    socket.on('cashOut', async ({ round }) => {
      const elapsed = Date.now() - (await Round.findOne({ roundId: round }))!.startTime.getTime();
      const multiplier = Math.floor(elapsed / 100) / 10;
      await Bet.updateOne({ user: socket.handshake.auth.userId, round }, { multiplier, cashOutAt: elapsed / 1000 });
    });
  });

  startRound();
};