import express from "express";
import cors from 'cors';
import dotenv from 'dotenv';
import postsRouter from './routes/posts';
import authRouter from './routes/auth';
import imagesRouter from './routes/images';
import logsRouter from './routes/logs';
import { initializeSchema } from './models/schema';
import cookieParser from 'cookie-parser';
import path from 'path';

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}))
app.use(express.json());

const Tokens = require('csrf');
const tokens = new Tokens();

app.use(cookieParser());

// Validate CSRF_SECRET existence
const CSRF_SECRET = process.env.CSRF_SECRET;
if (!CSRF_SECRET) {
  throw new Error('CSRF_SECRET must be defined in environment variables');
}

// Middleware to issue CSRF tokens to the frontend on every GET request
app.use((req, res, next) => {
  if (req.method === 'GET') {
    const csrfToken = tokens.create(CSRF_SECRET);
    res.cookie('csrf-token', csrfToken, { 
      secure: true, 
      sameSite: 'Strict',
      httpOnly: true
    });
    req.csrfToken = csrfToken;
  }
  next();
});

// Middleware to validate CSRF tokens for state-changing requests
app.use((req, res, next) => {
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    const token = req.cookies['csrf-token'];
    
    if (!token) {
      return res.status(403).json({ 
        error: 'CSRF token missing' 
      });
    }

    if (!tokens.verify(CSRF_SECRET, token)) {
      return res.status(403).json({ 
        error: 'Invalid CSRF token' 
      });
    }
  }
  next();
});

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

initializeSchema();

// Routes
app.use('/api/posts', postsRouter);
app.use('/api/auth', authRouter);
app.use('/api/images', imagesRouter);
app.use('/api/logs', logsRouter);

app.get("/", (req, res) => {
  res.send("Welcome to the Blog API");
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});