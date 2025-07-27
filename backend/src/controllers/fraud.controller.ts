import LoginLog from '../models/LoginLog';

export const getRiskScore = async (ip: string, userAgent: string, userId?: string) => {
  const logs = await LoginLog.find({ ip, userAgent, success: false }).countDocuments();
  return Math.min(logs * 2, 100); // simple heuristic
};