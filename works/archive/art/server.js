
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, {
    cors: {
        origin: "*", // Adjust this to be more restrictive based on your deployment
        methods: ["GET", "POST"]
    }
});

app.use(express.static('public')); // Serve static files

// Store the board state
// For simplicity, this example just stores each draw action in an array
let boardState = [];

// Handle socket connection
io.on('connection', (socket) => {
    console.log('A user connected');
    console.log(boardState)

    // Send the current board state to the newly connected client
    socket.emit('board state', boardState);

    // Listen for "draw" actions and update the board state
    socket.on('draw', (data) => {
        // Update the board state
        boardState.push(data);

        // Broadcast the draw data to all other clients
        socket.broadcast.emit('draw', data);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
