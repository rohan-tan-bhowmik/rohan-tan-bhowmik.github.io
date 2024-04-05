let socket;
let isDrawing = false; // Flag to track drawing state
let isNewStroke = false;
let canDraw = true;

function generateUID() {
    const timestamp = (new Date()).getTime().toString(36);
    const randomPortion = Math.random().toString(36).substr(2, 9);
    return timestamp + randomPortion;
}

function generateBrightColor() {
    let color;
    let attempt = 0;
    do {
      color = {
        r: Math.floor(Math.random() * 256),
        g: Math.floor(Math.random() * 256),
        b: Math.floor(Math.random() * 256)
      };
      // Increment attempt to avoid potentially infinite loops in edge cases
      attempt++;
      // Continue if any single color component is greater than 200
    } while (Math.max(color.r, color.g, color.b) <= 200 && attempt < 100);
  
    return color;
  }

let color = generateBrightColor();

  
// Store the generated UID for the session
const userUID = generateUID();

function setup() {
    createCanvas(800, 600);
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

    canvas.addEventListener('touchstart', function() {
        let fs = fullscreen();
        fullscreen(true);
    });

    // Prevent default touch actions on the canvas to stop scrolling/zooming
    const canvasElement = document.getElementById('defaultCanvas0'); // p5.js canvas ID
    if (canvasElement) {
        canvasElement.addEventListener('touchstart', preventDefaultTouch, { passive: false });
        canvasElement.addEventListener('touchmove', preventDefaultTouch, { passive: false });
        canvasElement.addEventListener('touchend', preventDefaultTouch, { passive: false });
    }

    saveImgBtn = createButton('Click here to save canvas!');
    saveImgBtn.mousePressed(() => {
        // The functionality to save the image goes here
        window.open("https://rohan-tan-bhowmik.github.io/works/art/final.html", '_blank');
    });
}


function preventDefaultTouch(e) {
    e.preventDefault();
}

let lastDrawTime = 0; // Keeps track of the last time the user drew

function draw() {

    background('#222'); // Clear background each frame
    // Text setup
    textSize(60); // Adjust text size as needed
    fill(153); // White color for the text
    noStroke();
    textAlign(CENTER, CENTER);
    text("Drag here to draw\nSee changes on canvas", width / 2, height / 2); // Position the text 30px above the bottom
    displayUserColor();

}

function displayUserColor() {
    // Ensure we have a valid user state before attempting to display color

    // Text setup
    textSize(30); // Adjust text size as needed
    fill(153); // White color for the text
    noStroke();
    textAlign(CENTER, CENTER);
    text("Your color:", width / 2 - 23, height - 50); // Position the text 30px above the bottom

    // Circle setup
    fill(color.r, color.g, color.b); // Use the user's current color
    noStroke();
    ellipse(width / 2 + 77, height - 50, 30, 30); // Draw the circle 10px above the bottom, 20px diameter
}

// function windowResized() {
//     resizeCanvas(windowWidth, windowHeight);
//     // Additional logic to adjust layout or elements like buttons if necessary
//   }

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
    if (canDraw) {
        // Assuming 'canvas' here refers to the p5.js canvas object, which might not be directly accessible by name.
        // If you haven't stored the p5.js canvas object in a variable named 'canvas', use the method below to get its position.

        // Correctly access the canvas element created by p5.js
        // p5.js sets a property 'canvas' on the p5 instance, which refers to the canvas element.

        const data = {
            x: x,
            y: y,
            px: px, // Previous mouseX position adjusted
            py: py, // Previous mouseY position adjusted
            color: color,
            isNewStroke,
            userUID // Include the unique identifier
        };

        // Emit the drawing data to the server
        socket.emit('drawing', data);

        // Also draw on the sender's canvas for immediate feedback
        drawLine(x, y, px, py);
    }
}
  
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
        // Try to enter fullscreen mode for the canvas (or document.body for the whole page)
        let fsElement = document.body; // Use document.body for full page, or canvas for just the canvas
        if (fsElement.requestFullscreen) {
            fsElement.requestFullscreen();
        } else if (fsElement.mozRequestFullScreen) { /* Firefox */
            fsElement.mozRequestFullScreen();
        } else if (fsElement.webkitRequestFullscreen) { /* Chrome, Safari & Opera */
            fsElement.webkitRequestFullscreen();
        } else if (fsElement.msRequestFullscreen) { /* IE/Edge */
            fsElement.msRequestFullscreen();
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) { /* Firefox */
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) { /* Chrome, Safari and Opera */
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) { /* IE/Edge */
            document.msExitFullscreen();
        }
    }
}

window.addEventListener('orientationchange', function() {
    var orientation = screen.orientation || window.orientation;
    if (orientation.type === "landscape-primary" || orientation.type === "landscape-secondary") {
      // Show message asking to rotate back to portrait
      alert("This application is best viewed in portrait mode.");
    } else {
      // Adjust UI for portrait mode
    }
  });
  