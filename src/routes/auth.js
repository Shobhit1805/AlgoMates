const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const { validateSignUpData } = require('../utils/validation');  
const jwt = require('jsonwebtoken');

const authRouter = express.Router();

authRouter.post("/signup", async (req, res) => {
  try {
    validateSignUpData(req);

    const { password, firstName, lastName, email } = req.body;
    const passwordHash = await bcrypt.hash(password, 10); // 10 is the salt rounds

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

authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      throw new Error("Invalid Credentials");
    }
    const isPasswordMatch = await user.validatePassword(password);
    if (isPasswordMatch) {
      const token = await user.getJWT();

      res.cookie("token", token, { expires: new Date(Date.now() + 10 * 900000) });
      res.send("Login successful");
    }
    else {
      throw new Error("Invalid Credentials");
    }
  }
  catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});




module.exports = authRouter;