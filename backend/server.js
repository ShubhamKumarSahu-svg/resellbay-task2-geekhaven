require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');

const { connectDB } = require('./config/db');
const { setupSwagger } = require('./config/swagger');
const initializeSocket = require('./config/socket');
const apiRoutes = require('./routes');

const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const {
  RequestLogger,
  requestLoggerMiddleware,
} = require('./middleware/requestLogger');

const app = express();
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: true,
    // origin: process.env.CLIENT_URL || 'http://localhost:3000',
    // methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
  path: '/socket.io',
});

app.use(helmet());
app.use(
  cors({
    // origin: process.env.CLIENT_URL || 'http://localhost:3000',
    origin: true,
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const logger = new RequestLogger(200);
app.use(requestLoggerMiddleware(logger));

app.use('/api', apiRoutes(io));

app.get('/logs', (req, res) => {
  res.status(200).json({ logs: logger.getLogs() });
});

app.get('/healthz', (req, res) => {
  const dbStatus =
    mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  const healthStatus = dbStatus === 'connected' ? 200 : 503;

  res.status(healthStatus).json({
    status: dbStatus === 'connected' ? 'healthy' : 'unhealthy',
    database: dbStatus,
    uptime: process.uptime().toFixed(2) + 's',
    timestamp: new Date().toISOString(),
  });
});

setupSwagger(app);

app.use(notFoundHandler);
app.use(errorHandler);

initializeSocket(io);

const startServer = async () => {
  try {
    await connectDB();
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () =>
      console.log(`Server running at http://localhost:${PORT}`)
    );
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = { app, server, io };
