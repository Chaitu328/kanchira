require("dotenv").config();
const express = require("express");
const http = require("http");
const connectDB = require("./db");
const cors = require("cors");
const authRoutes = require("./Routes/route");

const app = express();
const server = http.createServer(app); // Create HTTP server

const io = require("socket.io")(server, {
  cors: {
    origin: "*", // Allow all origins (for dev)
    methods: ["GET", "POST"],
  },
});

connectDB();
app.use(express.json());
app.use(cors());

app.use("/", authRoutes);

// === LIVE USER COUNT LOGIC ===
let liveUsers = 0;

io.on("connection", (socket) => {
  liveUsers++;
  console.log(`User connected: ${socket.id} | Live users: ${liveUsers}`);

  // Notify all clients of the new count
  io.emit("liveUserCount", liveUsers);

  socket.on("disconnect", () => {
    liveUsers--;
    console.log(`User disconnected: ${socket.id} | Live users: ${liveUsers}`);
    io.emit("liveUserCount", liveUsers);
  });
});

// Start server
const PORT = process.env.PORT || 3007;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
