const idempotencyStore = new Map();

setInterval(() => {
  const now = Date.now();
  const fiveMinutesAgo = now - 5 * 60 * 1000;
  for (const [key, value] of idempotencyStore.entries()) {
    if (value.timestamp < fiveMinutesAgo) {
      idempotencyStore.delete(key);
    }
  }
}, 60 * 1000);

const checkIdempotency = (req, res, next) => {
  const idempotencyKey = req.headers['idempotency-key'];
  if (!idempotencyKey) {
    return next();
  }

  const cachedResponse = idempotencyStore.get(idempotencyKey);
  const isExpired =
    Date.now() - (cachedResponse?.timestamp || 0) > 5 * 60 * 1000;

  if (cachedResponse && !isExpired) {
    res.set('X-Signature', cachedResponse.signature);
    return res.status(200).json(cachedResponse.response);
  }

  req.idempotencyKey = idempotencyKey;
  req.idempotencyStore = idempotencyStore;
  next();
};

module.exports = { checkIdempotency };
