const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Set up color picker
const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00'];
const colorPicker = document.getElementById('color-picker');
let currentColor = '#000000';

// Set the current color
function setCurrentColor(color) {
    currentColor = color;
}

// Add colors to the color picker in the UI
colors.forEach(color => {
    const colorDiv = document.createElement('div');
    colorDiv.style.backgroundColor = color;
    colorDiv.addEventListener('click', () => setCurrentColor(color));
    colorPicker.appendChild(colorDiv);
    console.log("a")
});

let isDrawing = false;

// Connect to WebSocket server
const socket = io('http://localhost:3000');
console.log("hj")

// Function to start drawing
function startDrawing(e) {
    console.log('Mouse down, start drawing'); // Diagnostic log
    isDrawing = true;
    draw(e); // Ensure drawing starts immediately
}

// Function to stop drawing
function stopDrawing() {
    isDrawing = false;
    ctx.beginPath(); // Start a new path to not connect lines
}

let startNewLine = false;

// The existing draw function sends the draw action to the server
// and should already include logic similar to this:
function draw(e) {
    if (!isDrawing) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const action = { 
        x, 
        y, 
        color: currentColor, 
        startNewLine: startNewLine // Include the flag in the action
    };

    // Reset the flag after the first action that starts the new line
    if (startNewLine) {
        startNewLine = false;
    }

    socket.emit('draw', action);
    performDrawAction(action);
}


// Function to perform the actual drawing on the canvas
function performDrawAction(action) {
    if (action.startNewLine) {
        ctx.beginPath();
        ctx.moveTo(action.x, action.y);
    } else {
        ctx.lineTo(action.x, action.y);
        ctx.strokeStyle = action.color;
        ctx.stroke();
    }

    // Prepare for a potentially continuous line from this point
    ctx.beginPath();
    ctx.moveTo(action.x, action.y);
}


// Now, implement drawFromState to render the saved actions
function drawFromState(actions) {
    actions.forEach(action => {
        performDrawAction(action);
    });
}

// Listen for draw events from the server and draw on the canvas
socket.on('draw', function(data) {
    const { x, y, color } = data;
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y);
});

socket.on('board state', (state) => {
    console.log("y")
    // Loop through the saved actions and draw them
    state.forEach((data) => {
        performDrawAction(data); // Implement this function to draw based on the saved state
    });
});

// Mouse event listeners
canvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    startNewLine = true; // Set the flag to start a new line
    draw(e); // This ensures a dot is placed if the mouse doesn't move
});
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);
