// importing required modules
import express from "express";
import cors from "cors";
import http from "http";
import colors from "colors";
import dotenv from "dotenv";
import { Server } from "socket.io";
import dbConnection from "./database/dbConnect.js";
import MessageModel from "./models/message.schema.js";

// configuring dotenv
dotenv.config();

// creating express instance
const app = express();
const port = process.env.PORT || 8080;

// creating http server
const server = http.createServer(app);

// initializing socket.io & enabling CORS for all origins and methods (GET, POST)
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// handle client connections requests
io.on("connection", (socket) => {
  console.log("User connetion established!".bgMagenta);

  //   get username from client
  socket.on("join", (data) => {
    socket.username = data;
    // show previous messages
    MessageModel.find({ userName: socket.username })
      .sort({ timestamp: 1 })
      .then((messages) => {
        io.emit("previous_messages", messages);
      })
      .catch((err) => {
        console.log(err);
      });
    io.emit("new_user", data);
  });

  // total number of users connected
  socket.on("total_users", () => {
    io.emit("total_users", io.clients().size);
  });

  // Broadcast typing event
  socket.on("typing", (data) => {
    io.emit("typing", data);
  });

  // Stop typing event
  socket.on("stopTyping", () => {
    io.emit("stopTyping");
  });

  socket.on("new_message", (msg) => {
    //   broadcasting new message to all connected clients
    const message = {
      username: socket.username,
      message: msg,
    };
    // save new messages to the database
    const newChat = new MessageModel({
      userName: socket.username,
      text: msg,
      timestamp: new Date(),
    });
    newChat.save();
    io.emit("broadcast_message", message);
  });

  socket.on("disconnect", () => {
    //  handle user disconnection
    if (socket.username) {
      // only emit if username exists
      io.emit("user_disconnected", socket.username);
    }
    console.log("User connection disconnected!".bgRed);
  });
});

// creating application server to listen on port
server.listen(port, () => {
  console.log(
    `ChatterUp ${process.env.ENVIRONMENT} server is running on port ${port}`
      .bgGreen
  );
  dbConnection();
});
