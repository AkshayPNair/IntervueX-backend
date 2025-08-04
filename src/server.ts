import dotenv from 'dotenv';
import mongoose from 'mongoose';
import app from './app'
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, './config/.env') });


const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || '';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(` Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error(' Failed to connect to MongoDB:', error);
  });


