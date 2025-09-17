const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
const db = {};

db.mongoose = mongoose;
db.user = require("./user.model");
db.admin = require("./admin.model");
db.incident = require("./incident.model");
db.geofence = require("./geofence.model");

module.exports = db;
