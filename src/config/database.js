const mongoose = require('mongoose');

const connectDB = async () => {
    await mongoose.connect("mongodb+srv://shobhitj1805:sM94Y22IBfZsKKWo@cluster0.eksdcup.mongodb.net/devTinder");
    //    / ke baad database ka naam to uss particular database se hi connect hoga
};
    
module.exports = connectDB;