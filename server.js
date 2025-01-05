const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const app = express();
const port = 3000;

const thoughtsFile = path.join(__dirname, "thoughts.json");

const ipMessageCount = {};
const messageLimit = 5;
const messageCooldownTime = 86400000;

const readThoughts = () => {
  try {
    if (fs.existsSync(thoughtsFile)) {
      const data = fs.readFileSync(thoughtsFile, "utf8");
      return data ? JSON.parse(data) : [];
    }
    return [];
  } catch (error) {
    console.error("Error reading thoughts file:", error);
    return [];
  }
};

const writeThoughts = (thoughts) => {
  try {
    fs.writeFileSync(thoughtsFile, JSON.stringify(thoughts, null, 2));
  } catch (error) {
    console.error("Error writing to thoughts file:", error);
  }
};

const getRemainingMessages = (ip) => {
  const currentTime = Date.now();
  if (!ipMessageCount[ip]) {
    ipMessageCount[ip] = { count: 0, lastRequest: currentTime };
  }

  if (currentTime - ipMessageCount[ip].lastRequest > messageCooldownTime) {
    ipMessageCount[ip].count = 0;
    ipMessageCount[ip].lastRequest = currentTime;
  }

  const remainingMessages = messageLimit - ipMessageCount[ip].count;
  const timeUntilReset = messageCooldownTime - (currentTime - ipMessageCount[ip].lastRequest);
  return { remainingMessages, timeUntilReset };
};

app.use(bodyParser.json());
app.use(express.static("public"));

app.get("/thoughts", (req, res) => {
  const thoughts = readThoughts();
  res.json(thoughts);
});

app.get("/message-status", (req, res) => {
  try {
    const ip = req.ip;
    const { remainingMessages, timeUntilReset } = getRemainingMessages(ip);

    res.json({ remainingMessages, timeUntilReset });
  } catch (error) {
    console.error("Error in /message-status route:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/thoughts", (req, res) => {
  const newThought = req.body.text;
  const ip = req.ip;

  const { remainingMessages } = getRemainingMessages(ip);
  if (remainingMessages <= 0) {
    return res.status(400).send({ message: "Message limit reached for today. Try again tomorrow." });
  }

  if (newThought) {
    const thoughts = readThoughts();
    thoughts.push(newThought);
    writeThoughts(thoughts);

    ipMessageCount[ip].count++;

    res.status(200).send({ message: "Thought added" });
  } else {
    res.status(400).send({ message: "Invalid thought" });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
