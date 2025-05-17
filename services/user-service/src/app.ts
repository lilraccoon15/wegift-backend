import iconv from 'iconv-lite';
import encodings from 'iconv-lite/encodings';
(iconv as any).encodings = encodings;

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from 'cookie-parser';
import userRoutes from './routes/userRoutes';

dotenv.config();

const app = express();

app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true,
}));

app.use(cookieParser()); 
app.use(express.json());

app.use('/api/users', userRoutes);

app.get("/", (_req, res) => {
  res.send("User service is running!");
});

export default app;
