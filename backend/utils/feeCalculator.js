const calculatePlatformFee = (subtotal) => {
  const seed = process.env.ASSIGNMENT_SEED || 'DEFAULT_SEED-25';

  const seedMatch = seed.match(/\d+/);
  const seedNumber = seedMatch ? parseInt(seedMatch[0], 10) : 25;

  const percentageFee = subtotal * 0.017;

  return Math.floor(percentageFee + seedNumber);
};

module.exports = { calculatePlatformFee };
