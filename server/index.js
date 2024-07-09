

const http = require("http");
const express = require("express");
const cors = require("cors");
const socketIO = require("socket.io");

const app = express();
const port = process.env.PORT || 5000;

const users = [{}];

app.use(cors());

app.get("/", (req, res) => {
    res.send("HELLO, IT'S WORKING");
});

const server = http.createServer(app);

// const io = socketIO(server, {
//     cors: {
//         origin: "*", // Adjust this to your frontend URL if necessary
//         methods: ["GET", "POST"],
//     }
// });
const io = socketIO(server, {
    cors: {
        origin: "http://localhost:3000", // Allow your React app's origin
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true
    }
});

io.on("connection", (socket) => {
    console.log("New Connection");

    socket.on('joined', ({ user }) => {
        users[socket.id] = user;
        console.log(`${user} has joined`);
        socket.broadcast.emit('userJoined', { user: "Admin", message: `${users[socket.id]} has joined` });
        socket.emit('welcome', { user: "Admin", message: `Welcome to the chat, ${users[socket.id]}` });
    });

    socket.on('message', ({ message, id }) => {
        io.emit('sendMessage', { user: users[id], message, id });
    });

    socket.on('disconnect', () => {
        socket.broadcast.emit('leave', { user: "Admin", message: `${users[socket.id]} has left` });
        console.log(`User left`);
    });
});

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
  