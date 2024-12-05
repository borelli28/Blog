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

app.use(cookieParser());

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