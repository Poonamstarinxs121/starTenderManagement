import express from 'express';
import cors from 'cors';
import documentsRouter from './routes/documents';
import usersRouter from './routes/users';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Register routes
app.use('/api/documents', documentsRouter);
app.use('/api/users', usersRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 