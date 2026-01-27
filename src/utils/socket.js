const socket = require('socket.io');
const crypto = require('crypto');
const { Chat } = require('../models/chat');
const ConnectionRequest = require('../models/connectionRequest');
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
    origin: 'http://localhost:5173', // frontend url
  },
});

// socket.io connection event handler
io.on('connection', (socket) => {

  socket.on('joinChat', ({firstName, userId, targetUserId}) => {
    const roomId = getSecretRoomId(userId, targetUserId);
    console.log(firstName + "joined room: " + roomId);
    socket.join(roomId);
  });

  socket.on('sendMessage', async ({firstName, userId, targetUserId, text}) => {
    // code to save message to database to be added here
    try {
        const roomId = getSecretRoomId(userId, targetUserId);
        console.log("Message from " + firstName + ": " + text);

        // bug : check if the users are connected before allowing message sending

        // Find the chat between the two users
        let chat = await Chat.findOne({
            participants: { $all: [userId, targetUserId] } // what all does : it means both userId and targetUserId should be in participants array
        });

        // If chat doesn't exist, create a new one
        if (!chat) {
            chat = new Chat({
                participants: [userId, targetUserId],
                messages: [],
            });
        }

        // Add the new message to the chat
        chat.messages.push({
            senderId: userId,
            text: text,
        });
        await chat.save();
        io.to(roomId).emit('messageReceived', {firstName, lastName, text});
    } 
    catch (error) {
      console.error("Error saving message to database: ", error);
    }
  });

  socket.on('disconnect', () => {
  });
});
};

module.exports = initializeSocket;