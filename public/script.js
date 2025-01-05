document.getElementById("addBubble").addEventListener("click", () => {
  const input = document.getElementById("thoughtInput");
  const text = input.value.trim();

  if (text) {
    fetch("/thoughts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: text }),
    })
      .then((response) => {
        if (response.ok) {
          createBubble(text);
          input.value = "";
          loadNewThought(text);
          loadThoughts();
        } else {
          response.json().then((data) => {
            alert(data.message);
          });
        }
      })
      .catch((error) => {
        console.error("Error sending thought:", error);
      });
  }
});

function updateMessageStatus() {
  fetch("/message-status")
    .then((response) => response.json())
    .then((data) => {
      const remainingMessages = data.remainingMessages;
      const timeUntilReset = data.timeUntilReset;

      const statusElement = document.getElementById("messageStatus");
      if (remainingMessages > 0) {
        statusElement.innerHTML = `You have ${remainingMessages} messages left today.`;
      } else {
        const resetTime = new Date(timeUntilReset).toISOString().substr(11, 8); // Convert to hh:mm:ss format
        statusElement.innerHTML = `Message limit reached. Try again in ${resetTime}.`;
      }
    })
    .catch((error) => console.error("Error fetching message status:", error));
}

setInterval(updateMessageStatus, 1000);

function createBubble(text) {
  const bubbleContainer = document.getElementById("bubbleContainer");
  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.textContent = text;

  const size = Math.random() * 100 + 50;
  bubble.style.width = `${size}px`;
  bubble.style.height = `${size}px`;
  bubble.style.left = `${Math.random() * (window.innerWidth - size)}px`;
  bubble.style.bottom = `-${size}px`;

  bubbleContainer.appendChild(bubble);

  setTimeout(() => {
    bubble.style.animation = "float 5s linear forwards";
  }, 0);

  bubble.addEventListener("animationend", () => {
    bubble.remove();
  });
}

function loadNewThought(newThought) {
  const thoughtsContainer = document.getElementById("bubbleContainer");
  if (!thoughtsContainer.textContent.includes(newThought)) {
    createBubble(newThought);
  }
}

function displayRandomThoughts(thoughts) {
  setInterval(() => {
    const randomThought = thoughts[Math.floor(Math.random() * thoughts.length)];
    createBubble(randomThought);
  }, Math.random() * (7000 - 2000) + 2000);
}

function loadThoughts() {
  fetch("/thoughts")
    .then((response) => response.json())
    .then((thoughts) => {
      if (!thoughts || thoughts.length === 0) {
        console.log("No thoughts available.");
      } else {
        displayRandomThoughts(thoughts);
      }
    })
    .catch((error) => console.error("Error fetching thoughts:", error));
}

function createCloud() {
  const cloud = document.createElement("img");
  cloud.src = "https://shorturl.at/UWx63"; 
  cloud.className = "cloud";

  const size = Math.random() * 400 + 450;
  cloud.style.width = `${size}px`;
  cloud.style.zIndex = -1;

  const startY = Math.random() * (window.innerHeight * 0.1);
  const duration = 30;

  cloud.style.top = `${startY}px`;
  cloud.style.left = `-${size}px`;

  cloud.style.animation = `moveCloud ${duration}s linear forwards`;

  cloud.addEventListener("animationend", () => {
    cloud.remove();
  });

  document.body.appendChild(cloud);
}

function generateClouds() {
  setInterval(() => {
    createCloud();
  }, Math.random() * (10000 - 5000) + 5000);
}

window.onload = () => {
  loadThoughts();
  generateClouds();
  updateMessageStatus();
};
