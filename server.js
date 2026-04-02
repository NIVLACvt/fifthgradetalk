const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

const users = {};
const messageHistory = [];

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.emit("all messages", messageHistory);

  socket.on("new user", (username) => {
    users[socket.id] = username;
    io.emit("update users", Object.values(users));
  });

  socket.on("chat message", (data) => {
    messageHistory.push(data);
    io.emit("chat message", data);
  });

  socket.on("reaction", (data) => {
    io.emit("reaction", data);
  });

  socket.on("disconnect", () => {
    delete users[socket.id];
    io.emit("update users", Object.values(users));
  });
});

server.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
