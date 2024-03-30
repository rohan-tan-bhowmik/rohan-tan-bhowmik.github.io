let socket;
// Example global variables for advanced drawing effects
let prevX, prevY; // To keep track of the last drawn point
let isFirstStroke = true; // Flag to identify the start of a new stroke
let prevThickness = 10; // Initial thickness
let thicknessChangeRate = 0; // Rate of change of thickness (first derivative)
let prevSpeed = 0; // To keep track of the previous speed for calculating acceleration
let prevBristlePoints = []; // Holds the start and end points for each bristle

function setup() {
    socket = io.connect('https://showy-sedate-run.glitch.me');

    createCanvas(800, 600);
    background(255);
    // Setup socket connection and event listener...
    socket.on('drawing', handleDrawingEvent);
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

//       // Store the new points for this bristle
//       prevBristlePoints[i] = {sx: startX, sy: startY, ex: endX, ey: endY};
//   }
// }
let cr = Math.random()*255;
let cb = Math.random()*255;
let cg = Math.random()*255;
let directionAngle = Math.random()*Math.PI*2;

 // RGBA where A is fully opaque
//LOOPY
function drawBristles(px, py, x, y, baseThickness, speed) {
  let bristles = 10;
  let baseRadius = 5;

  // Keep thickness inversely proportional to speed for thinner lines at higher speeds
  let adjustedThickness = max(map(speed, 0, 50, baseThickness, baseThickness / 3), 1);

  // Calculate direction of the main stroke for control point alignment
  
  stroke(cr, cb, cg, 255); // RGBA where A is fully opaque

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
    let controlDist = dist(px, py, x, y) * 0.5; // Distance influence on control point
    let cpX = (startX + endX) / 2 + cos(directionAngle) * controlDist;
    let cpY = (startY + endY) / 2 + sin(directionAngle) * controlDist;

    noFill();
    bezier(startX, startY, cpX, cpY, cpX, cpY, endX, endY);

    // Update bristle points for continuity
    prevBristlePoints[i] = {sx: startX, sy: startY, ex: endX, ey: endY};
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






function handleDrawingEvent(data) {
  if (data.isNewStroke) {
    isFirstStroke = true;
    prevThickness = 10;
    thicknessChangeRate = 0;
    prevSpeed = 0;
    prevBristlePoints = []; // Clear previous bristle points at the start of a new stroke
}


  let currentSpeed = sqrt((data.x - data.px) * (data.x - data.px) + (data.y - data.py) * (data.y - data.py));
  
  // Calculate acceleration (difference in speed from the last event)
  let speedAcceleration = currentSpeed - prevSpeed;
  prevSpeed = currentSpeed; // Update prevSpeed for the next event

  // Adjust the target rate of change based on speed acceleration
  // More acceleration implies a quicker change in thickness
  let targetRateOfChange = map(speedAcceleration, -50, 50, -1, 1);

  // Smoothly adjust the current rate of change towards the target
  thicknessChangeRate = lerp(thicknessChangeRate, targetRateOfChange, 0.1);

  // Apply the rate of change to the thickness
  let targetThickness = prevThickness + thicknessChangeRate;
  // Ensure thickness stays within reasonable bounds
  targetThickness = constrain(targetThickness, 1, 20);

  // Smooth transition of the actual thickness towards the target thickness
  let thickness = lerp(prevThickness, targetThickness, 0.1);

  if (!isFirstStroke) {
      drawBristles(prevX, prevY, data.x, data.y, thickness, currentSpeed);
  } else {
      isFirstStroke = false;
  }

  // Update for the next drawing event
  prevX = data.x;
  prevY = data.y;
  prevThickness = thickness; // Update the thickness for next time
}


