import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import depositRoutes from './routes/deposit.routes';
import withdrawalRoutes from './routes/withdrawal.routes';
import authRoutes from './routes/auth.routes';

// Load environment variables
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));   // serve screenshots
app.use('/api/auth', authRoutes);

mongoose.connect(process.env.MONGO_URI!);

app.use('/api', depositRoutes);
app.use('/api', withdrawalRoutes);

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Manual PSP backend on :${port}`));