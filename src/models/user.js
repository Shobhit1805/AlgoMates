const mongoose = require('mongoose');  
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
    },
    password: {  
        type: String,
        required: true
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
        default: "https://gimgs2.nohat.cc/thumb/f/350/person-icons-person-icon--m2i8m2A0K9H7N4m2.jpg"
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