let socket;
// Example global variables for advanced drawing effects
let prevX, prevY; // To keep track of the last drawn point
let isFirstStroke = true; // Flag to identify the start of a new stroke
let prevThickness = 10; // Initial thickness
let thicknessChangeRate = 0; // Rate of change of thickness (first derivative)
let prevSpeed = 0; // To keep track of the previous speed for calculating acceleration
let prevBristlePoints = []; // Holds the start and end points for each bristle
let userStates = {}; // Stores the drawing state for each user

let overlay;

let showCredits = false;
let creditsOpacity = 0;
let canvasSaved = false;

function setup() {
  overlay = loadImage('https://rohan-tan-bhowmik.github.io/works/art/soundbox-logo.png', img => {
    img.loadPixels();
    for (let i = 0; i < img.pixels.length; i += 4) {
      // The pixels array is a 1D array with 4 values per pixel: [R, G, B, A]
      let alpha = img.pixels[i + 3];
      if (alpha !== 0) { // If pixel is not transparent
        img.pixels[i] = 0; // R
        img.pixels[i + 1] = 0; // G
        img.pixels[i + 2] = 0; // B
        // Alpha remains unchanged
      }
    }
    img.updatePixels();
    let factor = 0.25;
    let newWidth = img.width * factor;
    let newHeight = img.height * factor;
    img.resize(newWidth, newHeight);
  });


  socket = io.connect('https://showy-sedate-run.glitch.me');
  createCanvas(800, 600);
  background('#222');
  socket.on('drawing', handleDrawingEvent);
  socket.on('requestCanvas', (data) => {
    let dataUrl = canvas.toDataURL('image/png');
    socket.emit('sendCanvas', {id: data.id, canvas: dataUrl})
  });
}

function strPad(number, length = 2) {
  let str = number.toString();
  while (str.length < length) {
    str = '0' + str;
  }
  return str;
}

function initializeUserState(userUID) {
  // Initialize or reset drawing parameters for the user
  return {
      prevX: 0,
      prevY: 0,
      isFirstStroke: true,
      prevThickness: 10,
      thicknessChangeRate: 0,
      prevSpeed: 0,
      prevBristlePoints: [],
      directionAngle: random(TWO_PI),
      lastDrawTime: 0
  };
}

// function drawBristles(px, py, x, y, baseThickness, speed) {
//   let bristles = 10; // Total number of bristles
//   let baseRadius = 5; // Base radius for bristle distribution
//   let speedFactor = map(speed, 0, 50, 0, 5); // Dynamic adjustment based on speed
//   let radius = baseRadius + 2 * speedFactor; // Adjust radius based on speed

//   // Set a fixed random seed for consistent randomness
//   randomSeed(99);

//   for (let i = 0; i < bristles; i++) {
//       // Introduce randomness in the angle and radius for each bristle
//       let angleVar = random(TWO_PI); // Random angle variation
//       let radiusVar = radius + random(-2, 2); // Random radius variation

//       let offsetX = cos(angleVar) * radiusVar;
//       let offsetY = sin(angleVar) * radiusVar;
//       let startX = px + offsetX;
//       let startY = py + offsetY;
//       let endX = x + offsetX;
//       let endY = y + offsetY;

//       // Calculate thickness variation, ensuring it doesn't go below 0.1
//       let thickness = max(baseThickness - map(abs(i - bristles / 2), 0, bristles / 2, 0, baseThickness / 2), 0.1);

//       strokeWeight(thickness);

//       if (prevBristlePoints.length === bristles) {
//           // Connect the bristle to its previous position for continuity
//           line(prevBristlePoints[i].sx, prevBristlePoints[i].sy, startX, startY);
//       }

//       // Draw the bristle segment
//       line(startX, startY, endX, endY);

//       // Store the new points for this brfistle
//       prevBristlePoints[i] = {sx: startX, sy: startY, ex: endX, ey: endY};
//   }
// }

 // RGBA where A is fully opaque
//LOOPY
function drawBristles(px, py, x, y, baseThickness, speed, currentState) {
  let bristles = 10;
  let baseRadius = 2;

  // Keep thickness inversely proportional to speed for thinner lines at higher speeds
  let adjustedThickness = max(map(speed, 0, 50, baseThickness, baseThickness / 3), 1);

  // Calculate direction of the main stroke for control point alignment
  let randomInfluence = random()-0.5;
  for (let i = 0; i < bristles; i++) {
    let angleVar = random(TWO_PI);
    let radiusVar = baseRadius + random(-2, 2);

    let offsetX = cos(angleVar) * radiusVar;
    let offsetY = sin(angleVar) * radiusVar;
    let startX = px + offsetX;
    let startY = py + offsetY;
    let endX = x + offsetX;
    let endY = y + offsetY;

    let thickness = max(adjustedThickness - map(abs(i - bristles / 2), 0, bristles / 2, 0, adjustedThickness / 2), 0.1);
    strokeWeight(thickness);

    // Set a random color for each bristle
    //stroke(random(255), random(255), random(255), 255); // RGBA where A is fully opaque

    // Align control points with the direction of the stroke for smoother transitions
    let randomNum = random()-0.5;
    let controlDist = dist(px, py, x, y) * (randomNum+randomInfluence); // Distance influence on control point
    let cpX = (startX + endX) / 2 + cos(currentState.directionAngle) * controlDist;
    let cpY = (startY + endY) / 2 + sin(currentState.directionAngle) * controlDist;

    noFill();
    bezier(startX, startY, cpX, cpY, cpX, cpY, endX, endY);

    // Update bristle points for continuity
    currentState.prevBristlePoints[i] = {sx: startX, sy: startY, ex: endX, ey: endY};
  }
  // Reset stroke color to default black for other operations
  stroke(0);
}


// function drawBristles(px, py, x, y, baseThickness, speed) {
//   const bristles = 10;
//   const baseRadius = 5;
//   const spring = 0.5;
//   const friction = 0.8;
//   const splitNum = 10; // This could be adjusted based on desired smoothness

//   // Adjust thickness inversely proportional to speed for dynamic effects
//   let adjustedThickness = max(map(speed, 0, 50, baseThickness, baseThickness / 3), 1);

//   // Simulate velocity based on the difference between points
//   let vx = (x - px) * spring;
//   let vy = (y - py) * spring;
//   vx *= friction;
//   vy *= friction;

//   // Simulate the change in radius (thickness) based on velocity
//   let v = sqrt(vx * vx + vy * vy);
//   let dynamicRadius = map(v, 0, 50, baseRadius, baseRadius / 2);

//   for (let i = 0; i < bristles; i++) {
//     let angle = TWO_PI / bristles * i;
//     let offsetX = cos(angle) * baseRadius;
//     let offsetY = sin(angle) * baseRadius;

//     let thickness = max(map(speed, 0, 50, baseThickness, baseThickness / 3), 1);
//     strokeWeight(thickness);

//     // Calculate start and end points for the bristle
//     let startX = px + offsetX;
//     let startY = py + offsetY;
//     let endX = x + offsetX;
//     let endY = y + offsetY;

//     // Calculate control points based on velocity, directing the curve along the movement
//     let cp1x = startX + vx / 3;
//     let cp1y = startY + vy / 3;
//     let cp2x = endX - vx / 3;
//     let cp2y = endY - vy / 3;

//     // Draw a bezier curve for the bristle
//     noFill();
//     bezier(startX, startY, cp1x, cp1y, cp2x, cp2y, endX, endY);
// }
// }


function draw(){
  if (overlay) {
    // Calculate the position to center the image
    let x = (width - overlay.width) / 2;
    let y = (height - overlay.height) / 2;
    
    // Use the image function with calculated x, y for centering
    image(overlay, x, y);
  }
  if (showCredits && !creditsShown && creditsOpacity < 255) {
    creditsOpacity += 255 / (60 * 10); // Assuming 60 FPS, increase opacity over 3 seconds

    textSize(12); // Set a smaller text size for "hello"
    textAlign(CENTER, BOTTOM); // Align text at the bottom center
    strokeWeight(0);
    fill(0, 0, 0, constrain(creditsOpacity, 0, 255)); // Use the current opacity for the text
    text("\"Wake Up\" - Rage Against the Machine", width / 2, height - 38); // Position "hello" at the bottom
    fill(0, 0, 0, constrain(creditsOpacity - 10, 0, 255)); // Use the current opacity for the text
    text("April 6th, 2024 @ Press Play: Carol Reiley and the Robots", width / 2, height - 22); // Position "hello" at the bottom
    textSize(14); // Set a smaller text size for "hello"
    fill(0, 0, 0, constrain(creditsOpacity - 20, 0, 255)); // Use the current opacity for the text
    text("Made by Rohan Tan Bhowmik", width / 2, height - 6); // Position "hello" at the bottom
    console.log(creditsOpacity);
    if (creditsOpacity > 60) {
      creditsShown = true;
      socket.emit('canvasData', { canvasData: canvas.toDataURL('image/png') });
    }
  }
}
function handleDrawingEvent(data) {
    // Check if this is a new user or a new stroke from an existing user
    if (!userStates[data.userUID] || data.isNewStroke) {
      if (!userStates[data.userUID]) {
          userStates[data.userUID] = initializeUserState(data.userUID);
      } else if (data.isNewStroke) {
          userStates[data.userUID].isFirstStroke = true;
          userStates[data.userUID].prevBristlePoints = [];
          // Consider resetting other parameters if needed
      }
  }

  // Retrieve the current user's state
  let currentState = userStates[data.userUID];
  
  console.log(currentState)
  color = data.color;
  stroke(color.r, color.g, color.b);

  // Call drawBristles with user-specific bristle points
  let currentSpeed = sqrt((data.x - data.px) * (data.x - data.px) + (data.y - data.py) * (data.y - data.py));
  
  // Calculate acceleration (difference in speed from the last event)
  let speedAcceleration = currentSpeed - currentState.prevSpeed;
  currentState.prevSpeed = currentSpeed; // Update prevSpeed for the next event

  // Adjust the target rate of change based on speed acceleration
  // More acceleration implies a quicker change in thickness
  let targetRateOfChange = map(speedAcceleration, -50, 50, -1, 1);

  // Smoothly adjust the current rate of change towards the target
  thicknessChangeRate = lerp(thicknessChangeRate, targetRateOfChange, 0.1);

  // Apply the rate of change to the thickness
  let targetThickness = currentState.prevThickness + thicknessChangeRate;
  // Ensure thickness stays within reasonable bounds
  targetThickness = constrain(targetThickness, 1, 20);

  // Smooth transition of the actual thickness towards the target thickness
  let thickness = lerp(currentState.prevThickness, targetThickness, 0.1);

  let currentTime = Date.now(); // Get current timestamp
  if (currentTime - currentState.lastDrawTime > 1000) { // Check if gap is more than 1 second
    data.isNewStroke = true; // Treat this event as starting a new stroke
  }
  currentState.lastDrawTime = currentTime;

  if (!data.isNewStroke) {
      drawBristles(currentState.prevX, currentState.prevY, data.x, data.y, thickness, currentSpeed, currentState);
  } else {
      isFirstStroke = false;
  }

  // Update global tracking variables
  // Update the current user's state
  currentState.prevX = data.x;
  currentState.prevY = data.y;
  currentState.prevThickness = lerp(currentState.prevThickness, targetThickness, 0.1);
  // Update other state variables as needed
}

// function handleDrawingEvent(data) {
//   // Assign a random color to the user if it hasn't been assigned yet
//   if (!userColors[data.userUID]) {
//     userColors[data.userUID] = {
//         r: random(255),
//         g: random(255),
//         b: random(255)
//     };
//   }

//   let userColor = userColors[data.userUID];
//   stroke(userColor.r, userColor.g, userColor.b);
//   fill(userColor.r, userColor.g, userColor.b); // If you're also using fill

//   if (data.isNewStroke) {
//       // Reset drawing attributes at the start of a new stroke
//       isFirstStroke = true;
//       prevThickness = 10;
//       thicknessChangeRate = 0;
//       prevSpeed = 0;
//       prevBristlePoints = [];
//       directionAngle = random(TWO_PI); // Consider user-specific direction if needed
//   } else {
//       isFirstStroke = false;
//   }


//   let currentSpeed = sqrt((data.x - data.px) * (data.x - data.px) + (data.y - data.py) * (data.y - data.py));
  
//   // Calculate acceleration (difference in speed from the last event)
//   let speedAcceleration = currentSpeed - prevSpeed;
//   prevSpeed = currentSpeed; // Update prevSpeed for the next event

//   // Adjust the target rate of change based on speed acceleration
//   // More acceleration implies a quicker change in thickness
//   let targetRateOfChange = map(speedAcceleration, -50, 50, -1, 1);

//   // Smoothly adjust the current rate of change towards the target
//   thicknessChangeRate = lerp(thicknessChangeRate, targetRateOfChange, 0.1);

//   // Apply the rate of change to the thickness
//   let targetThickness = prevThickness + thicknessChangeRate;
//   // Ensure thickness stays within reasonable bounds
//   targetThickness = constrain(targetThickness, 1, 20);

//   // Smooth transition of the actual thickness towards the target thickness
//   let thickness = lerp(prevThickness, targetThickness, 0.1);

//   if (!isFirstStroke) {
//       drawBristles(prevX, prevY, data.x, data.y, thickness, currentSpeed);
//   } else {
//       isFirstStroke = false;
//   }

//   // Update for the next drawing event
//   prevX = data.x;
//   prevY = data.y;
//   prevThickness = thickness; // Update the thickness for next time
// }



window.addEventListener('orientationchange', function() {
  var orientation = screen.orientation || window.orientation;
  if (orientation.type === "landscape-primary" || orientation.type === "landscape-secondary") {
    // Show message asking to rotate back to portrait
    alert("This application is best viewed in portrait mode.");
  } else {
    // Adjust UI for portrait mode
  }
});
