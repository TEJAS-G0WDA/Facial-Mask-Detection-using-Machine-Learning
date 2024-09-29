const URL = "https://teachablemachine.withgoogle.com/models/PRF2SpPix/";
let model, webcam, labelContainer, maxPredictions;
let isDetecting = false;

async function init() {
  if (isDetecting) return; // Exit if already detecting

  isDetecting = true;
  const modelURL = URL + "model.json";
  const metadataURL = URL + "metadata.json";
  model = await tmImage.load(modelURL, metadataURL);
  maxPredictions = model.getTotalClasses();

  const flip = true;
  webcam = new tmImage.Webcam(200, 200, flip);
  await webcam.setup();
  await webcam.play();
  window.requestAnimationFrame(loop);

  document.getElementById("webcam-container").appendChild(webcam.canvas);
  labelContainer = document.getElementById("label-container");
  for (let i = 0; i < maxPredictions; i++) {
    const labelText = document.createElement("div");
    labelText.className = "label-text";
    labelText.textContent = i === 0 ? "Not Wearing mask" : "Wearing mask";
    labelContainer.appendChild(labelText);

    const predictionBar = document.createElement("div");
    predictionBar.className = "prediction-bar";
    const predictionValue = document.createElement("div");
    predictionValue.className = "prediction-value";
    predictionValue.style.width = "0%";
    predictionBar.appendChild(predictionValue);
    const percentageText = document.createElement("span");
    percentageText.className = "percentage";
    percentageText.textContent = "0%";
    predictionBar.appendChild(percentageText);
    labelContainer.appendChild(predictionBar);
  }

  const buttonContainer = document.getElementById("button-container");
  const startButton = document.querySelector(".start-button");
  startButton.disabled = true;
  const stopButton = document.createElement("button");
  stopButton.textContent = "Stop Detection";
  stopButton.className = "start-button";
  stopButton.addEventListener("click", stopDetection);
  buttonContainer.appendChild(stopButton);
}

function stopDetection() {
  isDetecting = false;
  webcam.stop();
  const buttonContainer = document.getElementById("button-container");
  buttonContainer.innerHTML = "";
  const startButton = document.createElement("button");
  startButton.textContent = "Start Detection";
  startButton.className = "start-button";
  startButton.addEventListener("click", init);
  buttonContainer.appendChild(startButton);
}

async function loop() {
  if (!isDetecting) return; // Exit if detection stopped

  webcam.update();
  await predict();
  window.requestAnimationFrame(loop);
}

async function predict() {
  const prediction = await model.predict(webcam.canvas);
  for (let i = 0; i < maxPredictions; i++) {
    const predictionValue = prediction[i].probability.toFixed(2) * 100;
    const predictionBar =
      labelContainer.childNodes[i * 2 + 1].querySelector(".prediction-value");
    const percentageText =
      labelContainer.childNodes[i * 2 + 1].querySelector(".percentage");
    predictionBar.style.width = `${predictionValue}%`;
    percentageText.textContent = `${predictionValue}%`;
    percentageText.style.opacity = 1; // Show percentage with animation
  }
}
