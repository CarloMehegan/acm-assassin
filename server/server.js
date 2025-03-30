const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = 3000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Temporary user database
const users = {
  carlo: {
    password: "mehegan",
    playerId: "user-1",
    targetName: "David",
    linkId: "abc123",
    pin: "1234",
    logs: [],
  },
  david: {
    password: "cho",
    playerId: "user-2",
    targetName: "Carlo",
    linkId: "def456",
    pin: "5678",
    logs: [],
  },
};

//favicon
const path = require("path");
app.use("/favicon.ico", express.static(path.join(__dirname, "favicon.ico")));

// 🔐 Login route
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const user = users[username];
  if (!user || user.password !== password) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  // On success, return a session object
  res.json({
    username,
    playerId: user.playerId,
    targetName: user.targetName,
    linkId: user.linkId,
    pin: user.pin,
  });
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});


// 📈 Track route
// sends click log data to the dashboard
app.get("/logs/:playerId", (req, res) => {
  const playerId = req.params.playerId;
  const user = Object.values(users).find(u => u.playerId === playerId);
  if (!user) return res.status(404).json({ error: "Player not found" });

  res.json({ logs: user.logs });
});


//log: disarmed using PIN
app.post("/track/:linkId/submit-pin", (req, res) => {
  const { linkId } = req.params;
  const { pin } = req.body;

  const user = Object.values(users).find(u => u.linkId === linkId);
  if (!user) return res.status(404).json({ error: "Invalid link" });

  const click = {
    time: new Date().toISOString(),
    defused: user.pin === pin,
    admitted: false,
  };

  user.logs.push(click);

  if (click.defused) {
    res.json({ message: "Link disarmed successfully." });
  } else {
    res.json({ message: "Wrong PIN. Possibly a hit!" });
  }
});

//log: admitted to being phished
app.post("/track/:linkId/admit", (req, res) => {
  const { linkId } = req.params;

  const user = Object.values(users).find(u => u.linkId === linkId);
  if (!user) return res.status(404).json({ error: "Invalid link" });

  const click = {
    time: new Date().toISOString(),
    defused: false,
    admitted: true,
  };

  user.logs.push(click);

  res.json({ message: "Admitted." });
});

//log: timed out without defusing
app.post("/track/:linkId/timeout", (req, res) => {
  const { linkId } = req.params;

  const user = Object.values(users).find(u => u.linkId === linkId);
  if (!user) return res.status(404).json({ error: "Invalid link" });

  const click = {
    time: new Date().toISOString(),
    defused: false,
    admitted: false,
    timedOut: true,
  };

  user.logs.push(click);
  res.json({ message: "Timeout logged." });
});

//log: link opened
app.post("/track/:linkId/open", (req, res) => {
  const { linkId } = req.params;
  const { userAgent } = req.body;

  const user = Object.values(users).find(u => u.linkId === linkId);
  if (!user) return res.status(404).json({ error: "Invalid link" });

  const click = {
    time: new Date().toISOString(),
    defused: false,
    admitted: false,
    timedOut: false,
    opened: true,
    userAgent: userAgent || "Unknown",
  };

  user.logs.push(click);
  res.json({ message: "Open event logged." });
});

app.post("/track/:linkId/respond", (req, res) => {
  const { linkId } = req.params;
  const { name, note } = req.body;

  const user = Object.values(users).find(u => u.linkId === linkId);
  if (!user) return res.status(404).json({ error: "Invalid link" });

  const isDefusal = name === user.pin;

  const log = {
    time: new Date().toISOString(),
    defused: isDefusal,
    admitted: !isDefusal,
    name,
    note,
  };

  user.logs.push(log);

  if (isDefusal) {
    res.json({ message: "✅ Link successfully tested (disarmed with defusal code)." });
  } else {
    res.json({ message: "🙈 Thanks for participating in this phishing awareness game. Message logged!" });
  }
});


app.post("/track/:linkId/duration", express.text(), (req, res) => {
  const { linkId } = req.params;

  const user = Object.values(users).find(u => u.linkId === linkId);
  if (!user) return res.status(404).end();

  let data;
  try {
    data = JSON.parse(req.body);
  } catch (e) {
    return res.status(400).end();
  }

  const { timeSpent, userAgent } = data;

  user.logs.push({
    time: new Date().toISOString(),
    duration: timeSpent,
    userAgent,
    defused: false,
    admitted: false,
    timedOut: false,
    opened: false,
  });

  res.status(200).end();
});



//for the stats page
app.get("/stats", (req, res) => {
  const stats = Object.entries(users).map(([username, user]) => {
    const admittedHits = user.logs.filter(log => log.admitted).length;
    const messageCount = user.logs.filter(log => log.note && log.admitted).length;
    const totalOpens = user.logs.filter(log => log.opened || log.admitted || log.defused || log.timedOut || log.duration).length;

    const totalTime = user.logs.reduce((sum, log) => sum + (log.duration || 0), 0);

    const eliminated = user.logs.some(log => log.admitted);
    const status = eliminated ? "Eliminated" : "Active";

    return {
      username,
      status,
      admittedHits,
      messageCount,
      totalOpens,
      totalTimeSpent: totalTime // in seconds
    };
  });

  res.json(stats);
});
