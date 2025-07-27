"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BetSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    round: Number,
    amount: Number,
    cashOutAt: Number,
    multiplier: Number,
    profit: Number,
}, { timestamps: true });
exports.default = model('Bet', BetSchema);
