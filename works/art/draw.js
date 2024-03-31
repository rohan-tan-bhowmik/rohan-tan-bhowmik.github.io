let socket;
let isDrawing = false; // Flag to track drawing state
let isNewStroke = false;
let timer = 20000; // 30 seconds countdown
let countdown; // Holds the countdown interval
let canDraw = true;

function generateUID() {
    const timestamp = (new Date()).getTime().toString(36);
    const randomPortion = Math.random().toString(36).substr(2, 9);
    return timestamp + randomPortion;
}

// Store the generated UID for the session
const userUID = generateUID();

function setup() {
    createCanvas(800, 600);
    background(255);
    frameRate(60); // Ensure standard frame rate for consistency
    textSize(48); // Set text size
    textAlign(CENTER, CENTER); // Align text

    // Connect to the WebSocket server
    socket = io.connect('https://showy-sedate-run.glitch.me');
    console.log("Connected");

    // Listen for drawing events from the server
    socket.on('drawing', (data) => {
        drawLine(data.x, data.y, data.px, data.py);
    });

    socket.on('timerEnded', function() {
        canDraw = false; // Disable drawing
    
        // Show save options, for instance
        showSaveOptions(); // This function would need to handle UI changes for saving
    });
}

let lastDrawTime = 0; // Keeps track of the last time the user drew

function draw() {
    // Check if the user is currently drawing
    if (isDrawing) {
        const currentTime = millis(); // Get the current time in milliseconds
        // Check if at least a second has passed since the last draw
        let increment = 81;
        if (currentTime - lastDrawTime >= increment) {
            timer-=increment;
            lastDrawTime = currentTime; // Update the last draw time
        }
    }


    background('#333'); // Clear background each frame

    fill(255); // Set text color
    if (timer <= 0){
        fill(255, 0, 0);
        text("Draw Time Remaining: 0.000", width / 2, 50); // Display the timer
        isDrawing = false; // Optionally stop drawing
    } else {
        fill(255);
        text("Draw Time Remaining: " + timer/1000, width / 2, 50); // Display the timer
    }
}

// New function to draw line based on received data
function drawLine(x, y, px, py) {
    // Use previous (px, py) and current (x, y) coordinates to draw a line
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
    lastDrawTime = millis();

}

// Updated function to include previous coordinates
// Updated function to include previous coordinates and adjust for canvas position
function sendMouse(x, y, px, py) {
    if (timer > 0 && canDraw) {
        // Assuming 'canvas' here refers to the p5.js canvas object, which might not be directly accessible by name.
        // If you haven't stored the p5.js canvas object in a variable named 'canvas', use the method below to get its position.

        // Correctly access the canvas element created by p5.js
        // p5.js sets a property 'canvas' on the p5 instance, which refers to the canvas element.

        const data = {
            x: x,
            y: y,
            px: px, // Previous mouseX position adjusted
            py: py, // Previous mouseY position adjusted
            isNewStroke,
            userUID // Include the unique identifier
        };

        // Emit the drawing data to the server
        socket.emit('drawing', data);

        // Also draw on the sender's canvas for immediate feedback
        drawLine(x, y, px, py);
    }
}

function showSaveOptions() {
    // Create a new div element for save options
    let saveDiv = createDiv('');
    saveDiv.id('saveOptions');
    saveDiv.style('position', 'absolute');
    saveDiv.style('top', '50%');
    saveDiv.style('left', '50%');
    saveDiv.style('transform', 'translate(-50%, -50%)');
    saveDiv.style('text-align', 'center');
    
    // Create save image button
    let saveImgBtn = createButton('Save Image');
    saveImgBtn.parent(saveDiv);
    saveImgBtn.mousePressed(() => {
      saveCanvas('myCanvas', 'png');
    });
    
    // Create save GIF button (note: actual GIF saving requires additional implementation)
    let saveGifBtn = createButton('Save GIF');
    saveGifBtn.parent(saveDiv);
    saveGifBtn.mousePressed(() => {
      // Placeholder for GIF saving logic
      console.log("Save GIF functionality not implemented.");
    });
  }
  