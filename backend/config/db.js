import mongoose from "mongoose"

const MAX_RETRIES = 5;
const RETRY_DELAY = 5000; // 5 seconds

/**
 * Connect to MongoDB with retry logic and error handling
 */
export const connectDB = async (retryCount = 0) => {
  try {
    if (!process.env.MONGO_URL) {
      throw new Error("MONGO_URL environment variable is not set");
    }

    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    };

    await mongoose.connect(process.env.MONGO_URL, options);
    
    // Identify connection type without exposing credentials
    const mongoUrl = process.env.MONGO_URL;
    const isAtlas = mongoUrl.includes('mongodb.net') || mongoUrl.includes('mongodb+srv://');
    const isLocal = mongoUrl.includes('localhost') || mongoUrl.includes('127.0.0.1') || mongoUrl.includes('mongodb://localhost');
    
    // Extract database name
    const dbName = mongoose.connection.name;
    
    // Extract host info (safe to show)
    let hostInfo = 'Unknown';
    if (isAtlas) {
      // Extract cluster info from Atlas URL (e.g., cluster0.xxxxx.mongodb.net)
      const atlasMatch = mongoUrl.match(/mongodb\+srv:\/\/[^@]+@([^/]+)/) || mongoUrl.match(/mongodb:\/\/[^@]+@([^/]+)/);
      hostInfo = atlasMatch ? atlasMatch[1] : 'MongoDB Atlas';
    } else if (isLocal) {
      hostInfo = 'localhost:27017 (Local MongoDB)';
    }
    
    console.log("✅ Database connected successfully");
    console.log(`📍 Connection Type: ${isAtlas ? 'MongoDB Atlas (Cloud)' : isLocal ? 'Local MongoDB' : 'Other'}`);
    console.log(`📊 Database Name: ${dbName}`);
    console.log(`🌐 Host: ${hostInfo}`);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
      // Attempt to reconnect after delay
      setTimeout(() => connectDB(), RETRY_DELAY);
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });

    // Handle process termination
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed due to app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error(`❌ Database connection failed (Attempt ${retryCount + 1}/${MAX_RETRIES}):`, error.message);

    if (retryCount < MAX_RETRIES - 1) {
      console.log(`Retrying connection in ${RETRY_DELAY / 1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return connectDB(retryCount + 1);
    } else {
      console.error('❌ Failed to connect to database after maximum retries');
      console.error('Please check:');
      console.error('1. MongoDB server is running');
      console.error('2. MONGO_URL is correct in .env file');
      console.error('3. Network connectivity');
      process.exit(1);
    }
  }
};
