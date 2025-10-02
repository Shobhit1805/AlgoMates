const express = require('express');
const connectDB = require('./config/database');
const app = express();
const User = require('./models/user');
const bcrypt = require('bcrypt');
const { validateSignUpData } = require('./utils/validation');

app.use(express.json());


app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      throw new Error("Invalid Credentials");
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      throw new Error("Invalid Credentials");
    }
    res.send("Login successful");
  }
  catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});


// add new user
app.post("/signup", async (req, res) => {
  try {
    //validating the data coming from the user
    validateSignUpData(req);

    const {password, firstName, lastName, email} = req.body;
    //Encrypt the password before saving to database
    const passwordHash = await bcrypt.hash(password, 10); // 10 is the salt rounds
    console.log(passwordHash);


    // create new instance of user model
    const user = new User({
      firstName,
      lastName,
      email,
      password: passwordHash,
    });

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
    if(data?.skills.length > 10) {
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


