import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import cookieParser from 'cookie-parser';
import { connectToDatabase } from './config/database';
import authRoutes from './routes/auth';
import photosRoutes from './routes/photos';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectToDatabase().catch(err => {
  console.error('Failed to connect to MongoDB:', err);
  process.exit(1);
});

const app = express();
const PORT = process.env.PORT || 3001;
const SESSION_SECRET = process.env.SESSION_SECRET || 'your_session_secret_change_this_in_production';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/google-photos-app';

// Trust proxy - needed for secure cookies to work behind a proxy like Railway
app.set('trust proxy', 1);

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: function(origin, callback) {
    const allowedOrigins = [
      process.env.CLIENT_URL || 'http://localhost:5173',
      'https://google-photos-unofficial.praveenpuglia.com'
    ];
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, origin);
    } else {
      console.log(`Origin ${origin} not allowed by CORS: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Session configuration
app.use(session({
  secret: SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  store: MongoStore.create({
    mongoUrl: MONGODB_URI,
    ttl: 14 * 24 * 60 * 60, // 14 days
    autoRemove: 'native',
    touchAfter: 24 * 3600 // time period in seconds
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days
    sameSite: 'none',
    path: '/'
  }
}));

// Debug middleware to log session data
app.use((req, res, next) => {
  console.log('Session ID:', req.sessionID);
  console.log('Session data:', req.session);
  console.log('Cookies:', req.cookies);
  console.log('Headers:', req.headers);
  
  // Add a header to responses to help debug
  res.on('finish', () => {
    console.log('Response headers:', res.getHeaders());
  });
  
  next();
});

// Routes
app.use('/auth', authRoutes);
app.use('/photos', photosRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`MongoDB URI: ${MONGODB_URI}`);
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down server...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down server...');
  process.exit(0);
}); 