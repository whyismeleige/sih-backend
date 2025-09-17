const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./database");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT;
const io = new Server(server);

connectDB();

app.use(cors());
app.use(bodyParser.json());
require("./sockets", io);

server.listen(PORT, () => console.log("Server running on Port:", PORT));
