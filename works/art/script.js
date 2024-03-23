const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Set up color picker
const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00'];
const colorPicker = document.getElementById('color-picker');
let currentColor = '#FF0000';
ctx.lineWidth = 10; // Set the eraser to be thicker

// Add an eraser option
const eraser = document.createElement('div');
eraser.textContent = 'Eraser';
eraser.style.padding = '10px';
eraser.style.cursor = 'pointer';
eraser.addEventListener('click', () => {
    currentColor = '#FFFFFF'; // Assuming white is your canvas background color
    ctx.lineWidth = 10; // Set the eraser to be thicker
});
colorPicker.appendChild(eraser);

// Add an eraser option
const clear = document.createElement('div');
clear.textContent = 'Clear';
clear.style.padding = '10px';
clear.style.cursor = 'pointer';
clear.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Set the eraser to be thicker
});
colorPicker.appendChild(clear);


// Set the current color
function setCurrentColor(color) {
    currentColor = color;
    ctx.lineWidth = 10; // Reset to default line width
}

// Add colors to the color picker in the UI
colors.forEach(color => {
    const colorDiv = document.createElement('div');
    colorDiv.style.backgroundColor = color;
    colorDiv.addEventListener('click', () => setCurrentColor(color));
    colorPicker.appendChild(colorDiv);
});

// document.getElementById('clear-btn').addEventListener('click', () => {
//     // Clear the canvas
//     ctx.clearRect(0, 0, canvas.width, canvas.height);

//     // Emit a clear event to the server
//     socket.emit('clear');
// });


let isDrawing = false;

// Connect to WebSocket server
const socket = io('https://showy-sedate-run.glitch.me');

// Function to start drawing
function startDrawing(e) {
    console.log('Mouse down, start drawing'); // Diagnostic log
    isDrawing = true;
    startNewLine = true; // Set the flag to start a new line    
    draw(e); // Ensure drawing starts immediately
}

// Function to stop drawing
function stopDrawing() {
    isDrawing = false;
    startNewLine = true;
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


function performDrawAction(action) {
    if (action.startNewLine) {
        ctx.beginPath();
        ctx.moveTo(action.x, action.y);
    }
    
    
    ctx.lineTo(action.x, action.y);
    ctx.strokeStyle = action.color;
    ctx.stroke();

    // If you start a new path here, make sure to move to the current point afterward
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
    // const { x, y, color } = data;
    // ctx.lineTo(x, y);
    // ctx.stroke();
    // ctx.strokeStyle = color;
    // ctx.beginPath();
    // ctx.moveTo(x, y);
    performDrawAction(data);
});



socket.on('board state', (state) => {
    console.log("y")
    // Loop through the saved actions and draw them
    state.forEach((data) => {
        performDrawAction(data); // Implement this function to draw based on the saved state
    });
});

socket.on('clear', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});

// Mouse event listeners
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault(); // Prevent scrolling/zooming
    startDrawing(e.touches[0]); // Use the first touch point
}, { passive: false });

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault(); // Prevent scrolling/zooming
    draw(e.touches[0]); // Use the first touch point
}, { passive: false });

canvas.addEventListener('touchend', (e) => {
    e.preventDefault(); // Prevent any potential scroll/zoom behavior
    stopDrawing();
}, { passive: false });
