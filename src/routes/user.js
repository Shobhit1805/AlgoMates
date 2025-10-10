const express = require("express");
const user = require("../models/user");
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require('../models/connectionRequest');


const userRouter = express.Router();

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
userRouter.get("/user/connections", userAuth, async (req, res) => {
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

    console.log(connectionRequests);

    const data = connectionRequests.map((row) => {
      if (row.fromUserId._id.toString() === loggedInUser._id.toString()) {
        return row.toUserId;
      }
      return row.fromUserId;
    });

    res.json({ data });
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

module.exports = userRouter;