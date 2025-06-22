import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server, Socket } from 'socket.io';
import authRoutes from './routes/auth';
import problemRoutes from './routes/problems';
import submissionRoutes from './routes/submissions';
import { duelManager } from './duels/duelManager';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000', // Allow frontend to connect
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/submissions', submissionRoutes);

// Socket.io connection handler
io.on('connection', (socket: Socket) => {
  console.log('A user connected');

  // Handle duel creation
  socket.on('createDuel', (userData: { userId: string; username: string }) => {
    const room = duelManager.createDuel(userData, socket);
    socket.join(room.id);
    socket.emit('duelCreated', room);
  });

  // Handle duel joining
  socket.on('joinDuel', (data: { roomId: string; userId: string; username: string }) => {
    const room = duelManager.joinDuel(data.roomId, { userId: data.userId, username: data.username }, socket);
    if (room) {
      socket.join(room.id);
      io.to(room.id).emit('duelJoined', room);
    } else {
      socket.emit('joinError', { message: 'Failed to join duel' });
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('user disconnected');
    // TODO: Handle user leaving/disconnecting from a duel room
  });
});

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/algoarena';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 