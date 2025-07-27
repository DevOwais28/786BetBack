"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setup2FA = exports.verify2FA = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const speakeasy_1 = __importDefault(require("speakeasy"));
const qrcode_1 = __importDefault(require("qrcode"));
const User_1 = __importDefault(require("../models/User"));
const LoginLog_1 = __importDefault(require("../models/LoginLog"));
const Referral_1 = __importDefault(require("../models/Referral"));
const encrypt_1 = require("../middleware/encrypt");
const register = async (req, res) => {
    try {
        const { email, username, password, referralCode } = req.body;
        // Check if user exists
        const exists = await User_1.default.findOne({ $or: [{ email }, { username }] });
        if (exists) {
            return res.status(400).json({ message: 'User already exists' });
        }
        // Create new user
        const user = await User_1.default.create({ email, username, password });
        // Handle referral if provided
        if (referralCode) {
            const referrer = await User_1.default.findOne({ referralCode: referralCode.toUpperCase() });
            if (referrer) {
                await Referral_1.default.create({
                    referrer: referrer._id,
                    referee: user._id
                });
            }
        }
        res.status(201).json({ id: user._id });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Error during registration' });
    }
};
exports.register = register;
const login = async (req, res) => {
    const { email, password, ip, userAgent } = req.body;
    const user = await User_1.default.findOne({ email });
    if (!user || !(await bcryptjs_1.default.compare(password, user.password)))
        return res.status(401).json({ message: 'Invalid credentials' });
    // Fraud detection stub
    const riskScore = 0; // TODO: integrate fraud.service.ts
    await LoginLog_1.default.create({ user: user._id, ip, userAgent, success: true, riskScore });
    // Admin 2FA check
    if (user.role !== 'user' && user.twoFactorEnabled) {
        return res.json({ requiresTwoFactor: true, tempToken: (0, encrypt_1.encrypt)(user._id) });
    }
    const token = jsonwebtoken_1.default.sign({ id: user._id, role: user.role, twoFactorVerified: true }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token });
};
exports.login = login;
const verify2FA = async (req, res) => {
    const { tempToken, code } = req.body;
    const userId = (0, encrypt_1.encrypt)(tempToken); // decrypt
    const user = await User_1.default.findById(userId);
    if (!user)
        return res.status(401).json({ message: 'Invalid token' });
    const valid = speakeasy_1.default.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: code,
        window: 2,
    });
    if (!valid)
        return res.status(401).json({ message: 'Invalid 2FA code' });
    const token = jsonwebtoken_1.default.sign({ id: user._id, role: user.role, twoFactorVerified: true }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token });
};
exports.verify2FA = verify2FA;
const setup2FA = async (req, res) => {
    const { id } = req.user;
    const user = await User_1.default.findById(id);
    if (!user)
        return res.status(404).json({ message: 'User not found' });
    const secret = speakeasy_1.default.generateSecret({ length: 32 });
    user.twoFactorSecret = secret.base32;
    user.twoFactorEnabled = true;
    await user.save();
    const url = speakeasy_1.default.otpauthURL({
        secret: secret.base32,
        label: `786Bet (${user.email})`,
        issuer: '786Bet',
    });
    const qrDataURL = await qrcode_1.default.toDataURL(url);
    res.json({ qr: qrDataURL, secret: secret.base32 });
};
exports.setup2FA = setup2FA;
