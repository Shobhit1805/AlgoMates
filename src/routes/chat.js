const express = require('express');
const chatRouter = express.Router();
const { userAuth } = require('../middlewares/auth');
const { Chat } = require('../models/chat');

chatRouter.get('/chat/:targetUserId', userAuth, async (req, res) => {
    const { targetUserId } = req.params;
    const userId = req.user._id; // authenticated user's ID

    try {
        let chat = await Chat.findOne({
            participants: { $all: [userId, targetUserId] }
        }).populate(
            {path: 'messages.senderId', select: 'firstName lastName'}
        );
        if (!chat) {
            chat = new Chat({
                participants: [userId, targetUserId],
                messages: [],
            });
            await chat.save();
        }
        res.json(chat);
    } catch (error) {
        console.error("Error fetching or creating chat: ", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = chatRouter;