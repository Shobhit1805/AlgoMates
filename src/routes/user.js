const express = require("express");
const userRouter = express.Router();
const User = require("../models/user");
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require('../models/connectionRequest');

const USERs_SAFE_DATA = "firstName lastName photoUrl age about skills gender";

// get all the pending connection requests for the user 
userRouter.get("/user/requests/received",
    userAuth,
    async (req, res) => {
        try {
            const loggedInUser = req.user;
            const connectionRequests = await ConnectionRequest.find({
                toUserId: loggedInUser.id,
                status: "interested"
            }).populate("fromUserId", USERs_SAFE_DATA);

            res.json({
                message: "Connection Requests fetched successfully",
                data: connectionRequests,
            });
        } catch (err) {
            res.status(400).send("ERROR: " + err.message);
        }
    }
);

// get all the connections of the logged in user
userRouter.get("/user/connections",
    userAuth,
    async (req, res) => {
        try {
            const loggedInUser = req.user;

            const connectionRequests = await ConnectionRequest.find({
                $or: [
                    { toUserId: loggedInUser._id, status: "accepted" },
                    { fromUserId: loggedInUser._id, status: "accepted" },
                ],
            })
                .populate("fromUserId", USERs_SAFE_DATA)
                .populate("toUserId", USERs_SAFE_DATA);

            // console.log(connectionRequests);

            const data = connectionRequests.map((row) => {
                if (row.fromUserId._id.toString() === loggedInUser._id.toString()) {
                    return row.toUserId;
                }
                return row.fromUserId;
            });

            res.json({ data });
        } catch (err) {
            res.status(400).send("ERROR: " + err.message);
        }
    });

// to get the feed
userRouter.get("/feed",
    userAuth,
    async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            let limit = parseInt(req.query.limit) || 10;
            limit = limit > 30 ? 30 : limit;
            const skip = (page - 1) * limit;

            const loggedInUser = req.user;

            // Find all connection requests involving the logged-in user
            const connectionRequests = await ConnectionRequest.find({
                $or: [
                    { toUserId: loggedInUser._id },
                    { fromUserId: loggedInUser._id },
                ],
            }).select("toUserId fromUserId");

            const excludedUserIds = new Set();
            
            excludedUserIds.add(loggedInUser._id.toString());
            
            connectionRequests.forEach((request) => {
                excludedUserIds.add(request.toUserId.toString());
                excludedUserIds.add(request.fromUserId.toString());
            });

            console.log("Logged in user ID:", loggedInUser._id.toString());
            console.log("Excluded IDs:", Array.from(excludedUserIds));

            // Find users NOT in the excluded list
            const users = await User.find({
                _id: { $nin: Array.from(excludedUserIds) }
            })
            .select(USERs_SAFE_DATA)
            .skip(skip)
            .limit(limit);

            console.log("Users found:", users.length);

            res.json({ data: users });

        } catch (err) {
            res.status(400).send("ERROR: " + err.message);
        }
    }
);

module.exports = userRouter;