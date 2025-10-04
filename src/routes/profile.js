const express = require('express');
const profileRouter = express.Router();
const { userAuth } = require('../middlewares/auth');
const { validateEditProfileData } = require('../utils/validation');
const User = require('../models/user');
const bcrypt = require('bcrypt');


profileRouter.get("/profile/view", userAuth, async (req, res) => {
    try {
        const user = req.user;
        res.send(user);
    }
    catch (err) {
        res.status(400).send("ERROR: " + err.message);
    }
});


profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
    try {
        if (!validateEditProfileData(req)) {
            throw new Error("Invalid Edit Request");
        }

        const loggedInUser = req.user;
        Object.keys(req.body).forEach((key) => (loggedInUser[key] = req.body[key]));
        await loggedInUser.save();

        res.json({
            message: `${loggedInUser.firstName}, your profile updated successfuly`,
            data: loggedInUser,
        });

    }
    catch (err) {
        res.status(400).send("ERROR: " + err.message);
    }
});

profileRouter.patch("/profile/editPassword", userAuth, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // Validate input
        if (!currentPassword || !newPassword) {
            throw new Error("Current password and new password are required");
        }

        // Validate new password strength
        if (newPassword.length < 8) {
            throw new Error("New password must be at least 8 characters long");
        }

        const loggedInUser = req.user;

        // Verify current password
        const isPasswordValid = await bcrypt.compare(currentPassword, loggedInUser.password);
        if (!isPasswordValid) {
            throw new Error("Current password is incorrect");
        }

        // Check if new password is same as current
        if (currentPassword === newPassword) {
            throw new Error("New password must be different from current password");
        }

        // Hash the new password before saving
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        // Update password with hashed version
        loggedInUser.password = hashedPassword;
        await loggedInUser.save();

        res.json({
            message: `${loggedInUser.firstName}, your password has been updated successfully`,
        });


    } catch (err) {
        res.status(400).send("ERROR: " + err.message);
    }
});



module.exports = profileRouter;