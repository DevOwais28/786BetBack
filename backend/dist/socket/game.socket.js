"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initGame = void 0;
const socket_io_1 = require("socket.io");
const Round_1 = __importDefault(require("../models/Round"));
const Bet_1 = __importDefault(require("../models/Bet"));
const User_1 = __importDefault(require("../models/User"));
const crashLogic_1 = require("../utils/crashLogic");
const initGame = (server) => {
    const io = new socket_io_1.Server(server, { cors: { origin: '*' } });
    let currentRound = 1;
    let gameState = 'waiting';
    let crashPoint;
    const startRound = async () => {
        crashPoint = (0, crashLogic_1.randomCrash)(); // provably-fair
        await Round_1.default.create({ roundId: currentRound, crashPoint });
        io.emit('roundStart', { roundId: currentRound, crashPoint });
        gameState = 'running';
        setTimeout(async () => {
            gameState = 'ended';
            await Round_1.default.updateOne({ roundId: currentRound }, { status: 'ended' });
            io.emit('roundEnd', { roundId: currentRound, crashPoint });
            // settle bets
            const bets = await Bet_1.default.find({ round: currentRound });
            for (const bet of bets) {
                if (!bet.cashOutAt || bet.cashOutAt > crashPoint) {
                    // lost
                }
                else {
                    const profit = bet.amount * bet.multiplier;
                    await User_1.default.findByIdAndUpdate(bet.user, { $inc: { balance: profit } });
                }
            }
            currentRound++;
            setTimeout(startRound, 5000); // next round
        }, crashPoint * 1000);
    };
    io.on('connection', (socket) => {
        socket.on('placeBet', async ({ amount, round }) => {
            if (gameState !== 'waiting')
                return socket.emit('error', 'Late');
            await Bet_1.default.create({ user: socket.handshake.auth.userId, amount, round });
        });
        socket.on('cashOut', async ({ round }) => {
            const elapsed = Date.now() - (await Round_1.default.findOne({ roundId: round })).startTime.getTime();
            const multiplier = Math.floor(elapsed / 100) / 10;
            await Bet_1.default.updateOne({ user: socket.handshake.auth.userId, round }, { multiplier, cashOutAt: elapsed / 1000 });
        });
    });
    startRound();
};
exports.initGame = initGame;
