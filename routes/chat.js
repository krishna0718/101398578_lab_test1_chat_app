const express = require("express");
const GroupMessage = require("../models/GroupMessage");
const PrivateMessage = require("../models/PrivateMessage");
const router = express.Router();


router.post("/group-message", async (req, res) => {
    try {
        const { from_user, room, message } = req.body;

        if (!from_user || !room || !message.trim()) {
            return res.status(400).json({ message: "Invalid message data" });
        }

        const newMessage = new GroupMessage({ from_user, room, message });
        await newMessage.save();

        res.status(201).json({ message: "Group message saved!", data: newMessage });
    } catch (error) {
        console.error(" Group Chat Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

router.post("/private-message", async (req, res) => {
    try {
        const { from_user, to_user, message } = req.body;

        if (!from_user || !to_user || !message.trim()) {
            return res.status(400).json({ message: "Invalid private message data" });
        }

        const newMessage = new PrivateMessage({ from_user, to_user, message });
        await newMessage.save();

        res.status(201).json({ message: "Private message saved!", data: newMessage });
    } catch (error) {
        console.error(" Private Chat Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

router.get("/group-history/:room", async (req, res) => {
    try {
        const messages = await GroupMessage.find({ room: req.params.room }).sort({ date_sent: 1 });
        res.json(messages);
    } catch (error) {
        console.error(" Fetch Group Chat Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

router.get("/private-history/:from_user/:to_user", async (req, res) => {
    try {
        const { from_user, to_user } = req.params;
        const messages = await PrivateMessage.find({
            $or: [
                { from_user, to_user },
                { from_user: to_user, to_user: from_user }
            ]
        }).sort({ date_sent: 1 });

        res.json(messages);
    } catch (error) {
        console.error(" Fetch Private Chat Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;
