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
        canvasContainer.style.position = 'absolute';
        canvasContainer.style.left = '50%';
        canvasContainer.style.top = '50%';
        canvasContainer.style.transform = 'translate(-50%, -50%)';
        canvasContainer.style.textAlign = 'center'; // Center align the text
        document.body.appendChild(canvasContainer);

        const instructionText = document.createElement('p');
        instructionText.innerText = 'Instructions for downloading:\n\nTap and hold on the image,\nthen select "Save to Photos".';
        instructionText.style.color = 'white'; // Ensure the text is visible on a dark background
        instructionText.style.marginBottom = '20px'; // Space between the text and the image
        instructionText.style.fontFamily = 'Arial, sans-serif'; // Set font to Arial

        canvasContainer.appendChild(instructionText);

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
