// Remove default margin and padding from the body
document.body.style.margin = '0';
document.body.style.padding = '0';
document.querySelectorAll("*").forEach(el => {
    el.style.margin = '0';
    el.style.padding = '0';
});
document.body.style.overflowX = 'hidden'; // Prevent horizontal scroll

const loadingIndicator = document.createElement('div');
loadingIndicator.id = 'loadingIndicator';
loadingIndicator.innerText = 'Loading...';
loadingIndicator.style.display = 'none'; // Hidden by default

document.body.appendChild(loadingIndicator);

let socket = io.connect('https://showy-sedate-run.glitch.me');

socket.on('connect', () => {
    console.log(socket.id); // Now it should be defined
    document.getElementById('loadingIndicator').style.display = 'block'; // Show loading
    socket.emit('getCanvas', {id: socket.id});
});

socket.onAny((event, ...args) => {
    if (event != "timerEnded") {
        console.log(`Received event: ${event}`, args);
    }
});

socket.on('sentCanvas', (data) => {
    console.log(data);
    if (data.id === socket.id) {
        console.log("Got a canvas");
        const canvasContainer = document.createElement('div'); // Create a container for the image and text
        document.body.appendChild(canvasContainer);
        canvasContainer.style.textAlign = 'center'; // Center align the text

        canvasContainer.style.margin = '0';
        canvasContainer.style.padding = '0';

        const instructionText = document.createElement('p');
        instructionText.innerText = 'Instructions for downloading:\n\nTap and hold on the image,\nthen select "Save to Photos".';
        instructionText.style.color = 'white'; // Ensure the text is visible on a dark background
        instructionText.style.fontFamily = 'Arial, sans-serif'; // Set font to Arial
        instructionText.style.marginTop = '0'; // Start right from the top
        instructionText.style.fontSize = '36px'; // Modify font size
        canvasContainer.insertBefore(instructionText, canvasContainer.firstChild); // Insert the instruction text at the top of the container

        const img = new Image();
        img.onload = () => {
            // Hide the loading indicator when the image is loaded
            document.getElementById('loadingIndicator').style.display = 'none';
        };
        img.src = data.canvas;
        img.style.maxWidth = '90%'; // Limits image size to not overflow the viewport
        img.style.maxHeight = '90%';
        img.style.objectFit = 'contain';
        canvasContainer.appendChild(img); // Append the image inside the container
    }
});

console.log("ok");

window.addEventListener('orientationchange', function() {
    var orientation = screen.orientation || window.orientation;
    if (orientation.type === "landscape-primary" || orientation.type === "landscape-secondary") {
      // Show message asking to rotate back to portrait
      alert("This application is best viewed in portrait mode.");
    } else {
      // Adjust UI for portrait mode
    }
  });
  