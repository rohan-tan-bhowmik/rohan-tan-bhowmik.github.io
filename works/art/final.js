let socket = io.connect('https://showy-sedate-run.glitch.me');


socket.onAny((event, ...args) => {
    if (event != "timerEnded") {
        console.log(`Received event: ${event}`, args);
    }
});

socket.on('getCanvasSuccess', (data) => {
    console.log("Got a canvas");
    if (data.id === socket.id) {
        const img = new Image();
        img.src = 'data:image/png;base64,' + data.image;
        
        // Style the image to be centered
        img.style.position = 'absolute';
        img.style.left = '50%';
        img.style.top = '50%';
        img.style.transform = 'translate(-50%, -50%)';
        img.style.maxWidth = '90%'; // Limits image size to not overflow the viewport
        img.style.maxHeight = '90%';
        img.style.objectFit = 'contain';
        
        // Append the image to the body of the document
        document.body.appendChild(img);
    }
});

socket.emit('getCanvas');

console.log("ok");

