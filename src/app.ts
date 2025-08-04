import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import cookieParser from 'cookie-parser'
import authRoutes from './interfaces/routes/auth.routes'
import adminRoutes from './interfaces/routes/admin.routes'
import interviewerRoutes from './interfaces/routes/interviewer.routes'

const app = express();

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

//Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/interviewer', interviewerRoutes)

// Test endpoint
app.get('/', (_req, res) => {
  res.send(' API is running!');
});

export default app;
