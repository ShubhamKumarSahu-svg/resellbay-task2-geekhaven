const { AppError } = require('../utils/AppError');

const errorHandler = (err, req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    console.error(`Error on ${req.method} ${req.originalUrl}:`, err);
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      message: err.message,
      code: err.errorCode,
    });
  }
  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: 'Validation Error', details });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res
      .status(409)
      .json({ message: `An account with this ${field} already exists.` });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid ID format provided.' });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Invalid authentication token.' });
  }
  if (err.name === 'TokenExpiredError') {
    return res
      .status(401)
      .json({ message: 'Your session has expired. Please log in again.' });
  }

  return res.status(500).json({
    message: 'An unexpected internal server error occurred.',
  });
};

const notFoundHandler = (req, res, next) => {
  const error = new AppError(
    `The requested route was not found: ${req.method} ${req.originalUrl}`,
    404
  );
  next(error);
};

module.exports = { errorHandler, notFoundHandler };
