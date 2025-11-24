const express = require("express");
const { userAuth } = require("../middlewares/auth");
const paymentRouter = express.Router();
const razorpayInstance = require("../utils/razorpay");
const Payment = require("../models/payment");
const User = require("../models/user");
const { membershipAmount } = require("../utils/constants");
const { validateWebhookSignature} = require("razorpay/dist/utils/razorpay-utils");

paymentRouter.post("/payment/create", userAuth, async (req, res) => {
    try {
        const { membershipType } = req.body;
        const { firstName, lastName, emailId } = req.user;

        console.log("Creating order with amount:", membershipAmount[membershipType] * 100);

        const order = await razorpayInstance.orders.create({
            "amount": membershipAmount[membershipType] * 100,
            "currency": "INR",
            "receipt": `receipt_order_${Math.random() * 1000}`,
            "notes": {
                firstName,
                lastName,
                emailId,
                membershipType,
            }
        });

        console.log("Order object:", order);
        console.log("Order keys:", Object.keys(order));

        const payment = new Payment({
            userId: req.user._id,
            orderId: order.id,
            status: order.status,
            amount: order.amount,
            currency: order.currency,
            receipt: order.receipt,
            notes: order.notes,
        });
        const savedPayment = await payment.save();

        res.json({ ...savedPayment.toJSON(), keyId: process.env.RAZORPAY_KEY_ID });
    }
    catch (err) {
        console.error("Full error:", err);
        res.status(400).send("ERROR: " + err.message);
    }
});


paymentRouter.post("/payment/webhook", async (req, res) => {
    try {
        console.log("Webhook Called - Event:", req.body.event);

        // Validate webhook signature
        const webhookSignature = req.get("X-Razorpay-Signature");
        console.log("Webhook Signature:", webhookSignature);

        const isWebhookValid = validateWebhookSignature(
            JSON.stringify(req.body),
            webhookSignature,
            process.env.RAZORPAY_WEBHOOK_SECRET
        );

        if (!isWebhookValid) {
            console.log("Invalid Webhook Signature");
            return res.status(400).json({ msg: "Webhook signature is invalid" });
        }
        console.log("✓ Valid Webhook Signature");

        // Only process payment.authorized events
        if (req.body.event !== "payment.authorized") {
            console.log("Event not handled:", req.body.event);
            return res.status(200).json({ msg: "Event acknowledged but not processed" });
        }

        // Extract payment details
        const paymentDetails = req.body.payload.payment.entity;
        console.log("Payment status from Razorpay:", paymentDetails.status);

        // Find and update payment in DB
        const payment = await Payment.findOne({ orderId: paymentDetails.order_id });

        if (!payment) {
            console.error("Payment record not found for order:", paymentDetails.order_id);
            return res.status(404).json({ msg: "Payment record not found" });
        }

        payment.status = paymentDetails.status;
        await payment.save();
        console.log("✓ Payment updated in DB");

        // Only upgrade user if payment is captured
        if (payment.status !== "captured") {
            console.log("Payment not captured yet. Status:", payment.status);
            return res.status(200).json({
                msg: "Webhook processed but payment not captured",
                paymentStatus: payment.status
            });
        }

        // Find and update user
        const user = await User.findById(payment.userId);

        if (!user) {
            console.error("User not found:", payment.userId);
            return res.status(404).json({ msg: "User not found" });
        }

        user.isPremium = true;
        user.membershipType = payment.notes.membershipType;
        await user.save();
        console.log("✓ User upgraded to premium:", user.emailId);

        // Return success to Razorpay
        return res.status(200).json({
            msg: "Webhook received and user upgraded successfully",
            userId: user._id,
            membershipType: user.membershipType
        });

    } 
    catch (err) {
        console.error("Webhook error:", err.message);
        return res.status(500).json({ msg: err.message });
    }
});

paymentRouter.get("/premium/verify", userAuth, async (req, res) => {
    const user = req.user.toJSON();
    console.log(user);
    if (user.isPremium) {
        return res.json({ ...user });
    }
    return res.json({ ...user });
});

module.exports = paymentRouter;