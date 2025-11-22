const mongoose = require('mongoose');

const connectDB = async () => {
    await mongoose.connect("mongodb+srv://shobhitj1805:sM94Y22IBfZsKKWo@cluster0.eksdcup.mongodb.net/AlgoMatesDB");
};
    
module.exports = connectDB;