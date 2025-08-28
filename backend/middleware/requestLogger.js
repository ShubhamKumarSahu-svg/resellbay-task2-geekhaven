class RequestLogger {
  constructor(maxSize = 100) {
    this.logs = [];
    this.maxSize = maxSize;
  }

  addLog(logEntry) {
    this.logs.unshift(logEntry);
    if (this.logs.length > this.maxSize) this.logs.pop();
  }

  getLogs() {
    return [...this.logs];
  }
}

const requestLoggerMiddleware = (logger) => {
  return (req, res, next) => {
    const start = process.hrtime();

    const logEntry = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
    };

    const originalSend = res.send.bind(res);

    res.send = function (body) {
      logEntry.status = res.statusCode;
      const diff = process.hrtime(start);
      logEntry.duration = `${(diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2)}ms`;

      logger.addLog(logEntry);
      return originalSend(body);
    };

    next();
  };
};

const loggerInstance = new RequestLogger(200);

module.exports = { RequestLogger, loggerInstance, requestLoggerMiddleware };
