const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();


router.post("/signup", async (req, res) => {
    try {
        const { username, email, firstname, lastname, password } = req.body;

        if (!username || !email || !firstname || !lastname || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        let existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({ message: "Username or Email already exists" });
        }

       
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({ 
            username, 
            email, 
            firstname, 
            lastname, 
            password: hashedPassword 
        });

        await user.save();
        res.status(201).json({ message: "User registered successfully" });

    } catch (error) {
        console.error(" Signup Error:", error.message);
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
});


router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

       
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: "Invalid username or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid username or password" });
        }

        
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.json({ 
            message: "Login successful", 
            token, 
            user: { id: user._id, username: user.username } 
        });

    } catch (error) {
        console.error(" Login Error:", error.message);
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
});

module.exports = router;
