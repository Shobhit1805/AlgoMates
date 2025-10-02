const mongoose = require('mongoose');  
const validator = require('validator');


const userSchema = new mongoose.Schema({  
    firstName: {  
        type: String,
        required: true
    },  
    lastName: {  
        type: String   
    },  
    email: {  
        type: String,
        lowercase: true,
        required: true,
        unique: true,
        trim : true,
        validate(value) {
            if(!validator.isEmail(value)) {
                throw new Error("Invalid email address");
            }
        },
    },
    password: {  
        type: String,
        required: true,
        validate(value){
            if(!validator.isStrongPassword(value)) {
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
        validate(value) {
            if(!["male", "female", "other"].includes(value)) {
                throw new Error("Invalid gender");
            }
        },
    },  
    photoUrl: {  
        type: String,
        default: "https://gimgs2.nohat.cc/thumb/f/350/person-icons-person-icon--m2i8m2A0K9H7N4m2.jpg",
        validate(value){
            if(!validator.isURL(value)) {
                throw new Error("Invalid URL" + value);
            }
        },
    },
    about: {  
        type: String,
        default: "This is default about"
    },
    skills: {  
        type: [String]
    }   
}, 
{
    timestamps: true 
});

module.exports = mongoose.model('User', userSchema);