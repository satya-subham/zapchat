import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import path from 'path';



import authRoutes from './routes/auth.route.js';
import messageRoutes from './routes/message.route.js';
import { connectDB } from './lib/db.js';
import { app, server } from './lib/socket.js';


dotenv.config();

const PORT = process.env.PORT || 5001;

const __dirname = path.resolve();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true, // Allow cookies to be sent
}));
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' })); // Increase the limit if needed
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);

if(process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend', 'dist'/ 'index.html'));
  });
}
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  connectDB();
});