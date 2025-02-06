const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/auth");
const chatRoutes = require("./routes/chat");
const GroupMessage = require("./models/GroupMessage");
const User = require("./models/User");
const connectDB = require('./config/db')

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });


connectDB()

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));


app.use("/auth", authRoutes);
app.use("/chat", chatRoutes);

let onlineUsers = {}; 

io.on("connection", (socket) => {
    console.log(" A user connected");

    socket.emit("message",{user: "ChatBot", text: "Welcome to Chat Bot App"})

    
    socket.on("joinRoom", async ({ username, room }) => {
        socket.join(room);

        if (!onlineUsers[room]) onlineUsers[room] = [];
        if (!onlineUsers[room].includes(username)) onlineUsers[room].push(username);

        io.to(room).emit("message", { user: "admin", text: `${username} has joined the chat` });
        io.to(room).emit("updateUsers", onlineUsers[room]);

        
        await GroupMessage.create({ from_user: "admin", room, message: `${username} has joined the chat` });
    });

    socket.on("sendMessage", async ({ username, room, message }) => {
        if (!message.trim()) return;

        
        await GroupMessage.create({ from_user: username, room, message });

        
        io.to(room).emit("message", { user: username, text: message });

        
        botResponse(room, message);
    });

    
    socket.on("leaveRoom", async ({ username, room }) => {
        socket.leave(room);
        onlineUsers[room] = onlineUsers[room].filter(user => user !== username);

        io.to(room).emit("message", { user: "admin", text: `${username} has left the chat` });
        io.to(room).emit("updateUsers", onlineUsers[room]);

        await GroupMessage.create({ from_user: "admin", room, message: `${username} has left the chat` });
    });

    
    socket.on("typing", ({ username, room }) => {
        socket.to(room).emit("typing", { user: username });
    });

    
    socket.on("disconnect", () => {
        console.log(" User disconnected");
    });
});


async function botResponse(room, message) {
    const botReplies = {
        "hello": "Hi there! How can I help you today?",
        "help": "Sure! What do you need assistance with?",
        "time": `The current time is ${new Date().toLocaleTimeString()}.`,
        "date": `Today's date is ${new Date().toLocaleDateString()}.`,
        "bye": "Goodbye! Have a great day!",
    };

    let botReply = "I'm a simple bot. Try saying 'hello', 'help', 'time', 'date', or 'bye'.";

    for (let keyword in botReplies) {
        if (message.toLowerCase().includes(keyword)) {
            botReply = botReplies[keyword];
            break;
        }
    }

    setTimeout(async () => {
        io.to(room).emit("message", { user: "ChatBot", text: botReply });

        
        await GroupMessage.create({ from_user: "ChatBot", room, message: botReply });
    }, 1500);
}


const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(` Server running on port ${PORT}`));
