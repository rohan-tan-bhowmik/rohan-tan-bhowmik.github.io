let socket;
let isDrawing = false; // Flag to track drawing state
let isNewStroke = false;

function setup() {
    const canvas = createCanvas(800, 600);
    canvas.parent('drawingCanvas');
    background(255);

    socket = io.connect('https://showy-sedate-run.glitch.me');
    console.log("Connected");

    socket.on('drawing', (data) => {
        // Adjusted to handle isNewStroke if needed
        drawLine(data.x, data.y, data.px, data.py, data.isNewStroke);
    });

    // Ask for the user's name and emit it to the server
    const username = prompt("What's your name?");
    socket.emit('setUsername', username);
}

// Adjusted drawLine to optionally handle isNewStroke
function drawLine(x, y, px, py, isNewStroke = false) {
    if (isNewStroke) {
        // Handle new stroke initialization if needed
    }
    line(px, py, x, y);
}


function mousePressed() {
    // Start drawing
    isDrawing = true;
    isNewStroke = true; // Starting a new stroke
    //sendMouse(mouseX, mouseY, mouseX, mouseY); // Initial point
}

function mouseDragged() {
    if (isDrawing) {
        // Continue drawing
        sendMouse(mouseX, mouseY, pmouseX, pmouseY);
        if (isNewStroke) isNewStroke = false; // Only the first segment of the stroke is new
    }
}

function mouseReleased() {
    // Stop drawing
    isDrawing = false;
}

// Updated function to include previous coordinates
function sendMouse(x, y, px, py) {
    const data = {
        x,
        y,
        px, // Previous mouseX position
        py, // Previous mouseY position
        isNewStroke
    };

    // Emit the drawing data to the server
    socket.emit('drawing', data);

    // Also draw on the sender's canvas for immediate feedback
    drawLine(x, y, px, py);
}
