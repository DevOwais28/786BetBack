import LoginLog from '../models/LoginLog';

export const logLogin = async (
  userId: string,
  ip: string,
  userAgent: string,
  success: boolean
) => {
  let risk = 0;
  const failures = await LoginLog.find({ ip, success: false }).countDocuments();
  if (failures > 3) risk += 30;
  await LoginLog.create({ user: userId, ip, userAgent, success, riskScore: risk });
  return risk;
};