"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCrashMultiplier = exports.generateCrashHistory = exports.randomCrash = void 0;
const randomCrash = () => {
    const crashPoint = Math.random() * 10 + 1; // Random crash point between 1-11x
    return Math.round(crashPoint * 100) / 100; // Round to 2 decimal places
};
exports.randomCrash = randomCrash;
const generateCrashHistory = (count = 10) => {
    return Array.from({ length: count }, () => (0, exports.randomCrash)());
};
exports.generateCrashHistory = generateCrashHistory;
const getCrashMultiplier = () => {
    const random = Math.random();
    // 50% chance of crash at 1.00x (instant crash)
    if (random < 0.5)
        return 1.00;
    // 30% chance of crash between 1.01x - 2.00x
    if (random < 0.8)
        return Math.round((1 + Math.random()) * 100) / 100;
    // 15% chance of crash between 2.01x - 5.00x
    if (random < 0.95)
        return Math.round((2 + Math.random() * 3) * 100) / 100;
    // 5% chance of crash above 5.00x
    return Math.round((5 + Math.random() * 10) * 100) / 100;
};
exports.getCrashMultiplier = getCrashMultiplier;
