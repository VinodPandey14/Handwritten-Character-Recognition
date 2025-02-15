// Get the canvas element and context
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Set canvas dimensions
const canvasWidth = 400;
const canvasHeight = 400;
canvas.width = canvasWidth;
canvas.height = canvasHeight;

// Set initial background color to black
ctx.fillStyle = "#000";
ctx.fillRect(0, 0, canvasWidth, canvasHeight);

// Variables to track drawing state
let painting = false;
let lastX = 0;
let lastY = 0;

// Function to start drawing
canvas.addEventListener("mousedown", (e) => {
  painting = true;
  [lastX, lastY] = [e.offsetX, e.offsetY];
});

canvas.addEventListener("mousemove", (e) => {
  if (painting) {
    draw(e.offsetX, e.offsetY);
  }
});

canvas.addEventListener("mouseup", () => {
  painting = false;
});

canvas.addEventListener("mouseleave", () => {
  painting = false;
});

// Function to draw with smoother strokes
function draw(x, y) {
  ctx.strokeStyle = "#fff"; // White ink color
  ctx.lineWidth = 25; // Thicker stroke for better recognition
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(x, y);
  ctx.stroke();
  [lastX, lastY] = [x, y];
}

// Clear canvas functionality
document.getElementById("clearBtn").addEventListener("click", () => {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  ctx.fillStyle = "#000"; // Reset background color
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  document.getElementById("predictionResult").innerHTML = ""; // Clear result text
});

// Predict button functionality
document.getElementById("predictBtn").addEventListener("click", () => {
  const imageData = canvas.toDataURL("image/png"); // Get canvas image data

  fetch("/predict", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageData }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(
        "Prediction:",
        data.prediction,
        "Probability:",
        data.probability
      );
      console.log(
        "Alternative:",
        data.alternative_prediction,
        "Probability:",
        data.alternative_probability
      );

      // Update UI with prediction and probability
      document.getElementById("predictionResult").innerHTML = `
            <strong>Prediction:</strong> ${data.prediction} (${data.probability})<br>
            <strong>Alternative:</strong> ${data.alternative_prediction} (${data.alternative_probability})
        `;
    })
    .catch((error) => {
      console.error("Error:", error);
      document.getElementById(
        "predictionResult"
      ).innerHTML = `<span style="color:red;">Error: Unable to predict</span>`;
    });
});
