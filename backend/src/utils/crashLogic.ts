export const randomCrash = (): number => {
  return Math.round((Math.random() * 10 + 1) * 100) / 100;
};

export const generateCrashHistory = (count: number = 10): number[] => {
  return Array.from({ length: count }, () => randomCrash());
};
