const socket = require('socket.io');
const crypto = require('crypto');

// check it
const getSecretRoomId = (userId1, userId2) => {
    const sortedIds = [userId1, userId2].sort().join('_');
    const hash = crypto.createHash('sha256');
    hash.update(sortedIds);
    return hash.digest('hex');
};

const initializeSocket = (server) => {  
    const socket = require('socket.io');
    const io = socket(server, {
  cors: {
    origin: 'http://localhost:5173',
    // methods: ['GET', 'POST'],
    // credentials: true,
  },
});

// socket.io connection event handler
io.on('connection', (socket) => {
//   console.log('New client connected:', socket.id);

  socket.on('joinChat', ({firstName, userId, targetUserId}) => {
    const roomId= getSecretRoomId(userId, targetUserId);

    console.log("joined room: ", roomId);
    socket.join(roomId);
  });

  socket.on('sendMessage', ({firstName, userId, targetUserId, text}) => {
    const roomId= getSecretRoomId(userId, targetUserId);
    io.to(roomId).emit('messageReceived', {firstName, text});
  });

  socket.on('disconnect', () => {
  });
});
};

module.exports = initializeSocket;