const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

let currentPoll = null;
let answers = {};
let pollHistory = [];
let students = {}; // { socketId: { name } }

io.on("connection", (socket) => {
  console.log("New connection:", socket.id);

  // Register student name
  socket.on("registerStudent", (name) => {
    students[socket.id] = { name };
    io.emit("updateParticipants", Object.values(students));
  });

  // Teacher creates poll
  socket.on("createPoll", ({ question, options, duration }) => {
    currentPoll = { question, options, duration: duration || 60, startTime: Date.now() };
    answers = {};
    io.emit("newPoll", currentPoll);

    setTimeout(() => {
      io.emit("pollResults", { poll: currentPoll, answers });
      pollHistory.push({ ...currentPoll, answers });
      currentPoll = null;
    }, (duration || 60) * 1000);
  });

  // Student submits answer
  socket.on("submitAnswer", ({ studentName, option }) => {
    if (currentPoll) {
      answers[studentName] = option;
      io.emit("pollResults", { poll: currentPoll, answers });
    }
  });

  // Send active poll if a student joins late
  socket.on("checkPoll", () => {
    if (currentPoll) socket.emit("newPoll", currentPoll);
  });

  // Chat messages
  socket.on("chatMessage", ({ sender, message }) => {
    io.emit("chatMessage", { sender, message });
  });

  // Teacher kicks student
  socket.on("kickStudent", (name) => {
    const kickedId = Object.keys(students).find((id) => students[id].name === name);
    if (kickedId) {
      io.to(kickedId).emit("kickedOut");
      delete students[kickedId];
      io.emit("updateParticipants", Object.values(students));
    }
  });

  // Teacher requests poll history
  socket.on("getPollHistory", () => {
    socket.emit("pollHistory", pollHistory);
  });

  socket.on("disconnect", () => {
    delete students[socket.id];
    io.emit("updateParticipants", Object.values(students));
  });
});

server.listen(5000, () => console.log("Server running on http://localhost:5000"));
