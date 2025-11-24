const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String
    },
    emailId: {
        type: String,
        lowercase: true,
        required: true,
        unique: true,
        trim: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("Invalid emailId address");
            }
        },
    },
    password: {
        type: String,
        required: true,
        validate(value) {
            if (!validator.isStrongPassword(value)) {
                throw new Error("Password is not strong enough");
            }
        }
    },
    age: {
        type: Number,
        min: 18,
        max: 80
    },
    gender: {
        type: String,
        lowercase: true,
        trim: true,
        validate(value) {
            const validGenders = ["male", "female", "other"];
            if (!validGenders.includes(value)) {
                throw new Error(`${value} is not a valid gender type. Please choose from: ${validGenders.join(", ")}`);
            }
        }
    },
    isPremium: {
        type: Boolean,
        default: false,
    },
    membershipType: {
        type: String,
    },
    photoUrl: {
        type: String,
        default: "https://gimgs2.nohat.cc/thumb/f/350/person-icons-person-icon--m2i8m2A0K9H7N4m2.jpg",
        validate(value) {
            if (!validator.isURL(value)) {
                throw new Error("Invalid URL" + value);
            }
        },
    },
    about: {
        type: String,
        default: "This is default about",
        maxlength: 500
    },
    skills: {
        type: [String],
        validate(value) {
            if (value.length > 10) {
                throw new Error("You can add maximum 10 skills");
            }
        }
    }
},
    {
        timestamps: true
    });


userSchema.methods.getJWT = function () {
    const user = this;

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });

    return token;
};

userSchema.methods.validatePassword = async function (passwordByUser) {
    const user = this;
    const passwordHash = user.password;

    const isPasswordValid = await bcrypt.compare(
        passwordByUser,
        passwordHash
    );

    return isPasswordValid;
};


module.exports = mongoose.model('User', userSchema);