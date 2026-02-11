const socketIO = require("socket.io");
const crypto = require("crypto");
const { Chat } = require("../models/chat");
const ConnectionRequest = require("../models/connectionRequest");

// Generate a deterministic private room ID for two users
const getSecretRoomId = (userId1, userId2) => {
  const sortedIds = [userId1, userId2].sort().join("_");
  const hash = crypto.createHash("sha256");
  hash.update(sortedIds);
  return hash.digest("hex");
};

const initializeSocket = (server) => {
  const io = socketIO(server, {
    cors: {
      origin: "http://localhost:5173", // frontend URL
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    // Join chat room
    socket.on("joinChat", ({ firstName, userId, targetUserId }) => {
      const roomId = getSecretRoomId(userId, targetUserId);
      console.log(firstName + " joined room: " + roomId);
      socket.join(roomId);
    });

    // Send message
    socket.on(
      "sendMessage",
      async ({ firstName, lastName, userId, targetUserId, text }) => {
        try {
          const roomId = getSecretRoomId(userId, targetUserId);
          console.log("Message from " + firstName + ": " + text);

          // ✅ Check if users are connected (friends)
          const connection = await ConnectionRequest.findOne({
            $or: [
              {
                fromUserId: userId,
                toUserId: targetUserId,
                status: "accepted",
              },
              {
                fromUserId: targetUserId,
                toUserId: userId,
                status: "accepted",
              },
            ],
          });

          if (!connection) {
            console.log("Users are not connected. Message not sent.");
            return;
          }

          // ✅ Find existing chat
          let chat = await Chat.findOne({
            participants: { $all: [userId, targetUserId] },
          });

          // ✅ Create chat if it doesn't exist
          if (!chat) {
            chat = new Chat({
              participants: [userId, targetUserId],
              messages: [],
            });
          }

          // ✅ Save message
          chat.messages.push({
            senderId: userId,
            text,
          });

          await chat.save();

          // ✅ Emit message to room
          io.to(roomId).emit("messageReceived", {
            firstName,
            lastName,
            text,
          });
        } catch (error) {
          console.error("Error saving message to database:", error);
        }
      }
    );

    socket.on("disconnect", () => {
      // Optional: cleanup / logs
    });
  });
};

module.exports = initializeSocket;
