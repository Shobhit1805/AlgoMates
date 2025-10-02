const express = require('express');
const connectDB = require('./config/database');
const app = express();
const User = require('./models/user');
app.use(express.json());

// add new user
app.post("/signup", async (req, res) => {
  // create new instance of user model
  const user = new User(req.body);

  try {
    await user.save();
    res.send("User added successfully");
  }
  catch (err) {
    res.status(400).send("Error adding user" + err.message);
  }

});

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
    const user = await User.findByIdAndUpdate(userId, req.body, { new: true, runValidators: true });
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


