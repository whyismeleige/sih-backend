require("dotenv").config();
const mongoose = require("mongoose");
const url = process.env.MONGO_URI;
const dbName = process.env.DB_NAME;

const connectDB = () => {
  mongoose
    .connect(url, { dbName })
    .then(() => console.log("Successfully connected to Mongo DB"))
    .catch((error) => console.error("Connection Error", error));
};

module.exports = connectDB;