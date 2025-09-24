import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import cookieParser from 'cookie-parser'
import authRoutes from './interfaces/routes/auth.routes'
import adminRoutes from './interfaces/routes/admin.routes'
import interviewerRoutes from './interfaces/routes/interviewer.routes'
import userRoutes from './interfaces/routes/user.routes'
import chatRoutes from './interfaces/routes/chat.routes'
import compilerRoutes from './interfaces/routes/compiler.routes'

const app = express();

app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000','https://dbacb5b29269.ngrok-free.app','https://intervuex.akshaypnair.space'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH ' ,'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie']
}));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb"}));
app.use(cookieParser())

//Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/interviewer', interviewerRoutes);
app.use('/api/user',userRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/compiler', compilerRoutes)

// Test endpoint
app.get('/', (_req, res) => {
  res.send(' API is running!');
});

export default app;
