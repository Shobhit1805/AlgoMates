const Razorpay = require("razorpay");

var instance = new Razorpay({
  key_id: "dummy", // process.env.RAZORPAY_KEY_ID --- IGNORE ---
  key_secret: "dummy", // process.env.RAZORPAY_KEY_SECRET --- IGNORE ---
});

module.exports = instance;