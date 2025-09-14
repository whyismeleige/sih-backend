const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const connectDB = require("./database");
require("dotenv").config();

connectDB();

const app = express();
const PORT = process.env.PORT;

app.listen(PORT, () => console.log("Server running on Port:", PORT));