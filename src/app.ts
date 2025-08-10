import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import cookieParser from 'cookie-parser'
import authRoutes from './interfaces/routes/auth.routes'
import adminRoutes from './interfaces/routes/admin.routes'
import interviewerRoutes from './interfaces/routes/interviewer.routes'
import userRoutes from './interfaces/routes/user.routes'

const app = express();

app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH ' ,'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie']
}));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

//Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/interviewer', interviewerRoutes);
app.use('/api/user',userRoutes)

// Test endpoint
app.get('/', (_req, res) => {
  res.send(' API is running!');
});

export default app;
