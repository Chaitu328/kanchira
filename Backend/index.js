require("dotenv").config();
const express = require("express");
const http = require("http");
const connectDB = require("./db");
const cors = require("cors");
const authRoutes = require("./Routes/route");
const superAdminRoutes = require("./superadmin/routes/index");

const app = express();
const server = http.createServer(app);

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

connectDB();
app.use(express.json());
app.use(cors());

// Regular API routes
app.use("/api", authRoutes);

// ✅ FIX: frontend calls /api/superadmin/... so mount under both prefixes
app.use("/api/superadmin", superAdminRoutes);
app.use("/superadmin", superAdminRoutes);  // keep for any direct calls

// === LIVE USER COUNT LOGIC ===
let liveUsers = 0;

io.on("connection", (socket) => {
  liveUsers++;
  console.log(`User connected: ${socket.id} | Live users: ${liveUsers}`);
  io.emit("liveUserCount", liveUsers);

  socket.on("disconnect", () => {
    liveUsers--;
    console.log(`User disconnected: ${socket.id} | Live users: ${liveUsers}`);
    io.emit("liveUserCount", liveUsers);
  });
});

const PORT = process.env.PORT || 3007;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});