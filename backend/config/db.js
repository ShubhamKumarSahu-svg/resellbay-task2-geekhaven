const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error(
        'FATAL ERROR: MONGODB_URI environment variable is not set.'
      );
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log('MongoDB connection established successfully.');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB connection lost.');
});
mongoose.connection.on('reconnected', () => {
  console.log('MongoDB reconnected.');
});

module.exports = { connectDB };
