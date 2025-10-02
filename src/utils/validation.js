const validator = require('validator');

const validateSignUpData = (req) => {
    const {firstName, lastName, email, password} = req.body;

    if(!firstName || !lastName) {
        throw new Error("Name is not valid");
    }
    else if (firstName.length < 4 || firstName.length > 50) {
        throw new Error("FirstName must be between 4 and 50 characters");
    }
    else if (!validator.isEmail(email)) {
        throw new Error("Invalid email address");
    }
    else if (!validator.isStrongPassword(password)) {
        throw new Error("Please enter a strong password");
    }
}

exports.validateSignUpData = validateSignUpData;