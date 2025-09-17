const mongoose = require("mongoose");

const GeofenceSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["circle", "polygon"],
    default: "circle",
  },
  geometry: {
    center: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    radius: Number,
    coordinates: [[Number]],
  },
  tag: String,
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high", "critical"],
    default: "medium",
  },
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Geofence", GeofenceSchema);
