const express = require('express');
const connectDB = require('./config/database');
const app = express();
const User = require('./models/user');
const cookieParser = require('cookie-parser');


app.use(express.json());
app.use(cookieParser());

const authRouter = require('./routes/auth');
const profileRouter = require('./routes/profile');
const requestRouter = require('./routes/request');

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);

// Get user by email
app.get("/user", async (req, res) => {
  const userEmail = req.body.email;
  try {
    const users = await User.find({ email: userEmail });
    if (users.length === 0) {
      return res.status(404).send("User not found");
    }
    else {
      res.send(users);
    }
  }
  catch (err) {
    res.status(400).send("Something went wrong");
  }
});

// Get all users
app.get("/feed", async (req, res) => {
  try {
    const users = await User.find();
    res.send(users);
  }
  catch (err) {
    res.status(400).send("Something went wrong");
  }
});

// Delete user by ID
app.delete("/user", async (req, res) => {
  const userId = req.body.userId;
  try {
    console.log(userId);
    const user = await User.findByIdAndDelete(userId);
    res.send("User deleted successfully");
  }
  catch (err) {
    res.status(400).send("Something went wrong");
  }
});

//update data of the user 
app.patch("/user/:userId", async (req, res) => {
  const userId = req.params.userId;
  const data = req.body;

  try {
    const ALLOWED_UPDATES = ["userId", "photoUrl", "about", "gender", "age", "skills"];

    const isUpdateAllowed = Object.keys(data).every((key) => ALLOWED_UPDATES.includes(key));

    if (!isUpdateAllowed) {
      throw new Error("Update not allowed");
    }
    if (data?.skills.length > 10) {
      throw new Error("You can add maximum 10 skills");
    }
    const user = await User.findByIdAndUpdate(userId, req.body,
      { new: true, runValidators: true });
    res.send(user);
  }
  catch (err) {
    res.status(400).send("Something went wrong" + err.message);
  }
});


connectDB()
  .then(() => {
    console.log("Database connected successfully");
    app.listen(7777, () => {
      console.log('Server is successfully listening on port 7777');
    });
  })
  .catch((err) => {
    console.error("Database connection failed");
  }); 