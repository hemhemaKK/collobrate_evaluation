const express = require("express");
const http = require("http"); 
const socketio = require("socket.io");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDb = require('./config/db');

const Userrouter = require("./routes/UserRoutes");
const boardRouter = require("./routes/boardRoutes");
const taskRouter = require("./routes/taskRoutes");

dotenv.config();
connectDb();

const app = express();
app.use(cors());
app.use(express.json());

// Create HTTP server and attach Socket.IO
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: "*", // replace with your frontend URL in production
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Make io accessible in controllers
app.set("io", io);

// Socket.IO connection log
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("boardChanged", (data) => {
    console.log("Board change received:", data);
    socket.broadcast.emit("boardChanged", data); // broadcast to others
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Routes
app.get('/', (req, res) => {
    res.send('server running...');
    console.log("server started");
});

app.use("/api/user", Userrouter);
app.use("/api/board", boardRouter);
app.use("/api/task", taskRouter);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
