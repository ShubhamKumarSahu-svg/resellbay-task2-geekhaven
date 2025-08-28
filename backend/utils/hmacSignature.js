const crypto = require('crypto');

const generateHMACSignature = (data) => {
  const secret = process.env.ASSIGNMENT_SEED;
  if (!secret) {
    console.warn(
      'Warning: ASSIGNMENT_SEED is not set. HMAC signature will be insecure.'
    );
  }

  return crypto
    .createHmac('sha256', secret || 'default-secret')
    .update(JSON.stringify(data))
    .digest('hex');
};

module.exports = { generateHMACSignature };
