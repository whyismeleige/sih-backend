const mongoose = require("mongoose");

const IncidentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  geofence: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Geofence",
  },
  title: String,
  description: String,
  type: {
    type: String,
    enum: [
      "unauthorized_access",
      "emergency_alert",
      "evacuation_needed",
      "zone_breach",
      "device_offline",
      "geofence_violation",
    ],
    required: true,
  },
  severity: {
    type: String,
    enum: ["low", "medium", "high", "critical"],
    required: true,
  },
  status: {
    type: String,
    enum: ["active", "acknowledged", "resolved", "closed"],
    default: "active",
  },
  location: {
    latitude: Number,
    longitude: Number,
    address: String,
  },
  assignedTo: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
  ],
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization",
  },
  responses: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      action: String,
      notes: String,
      timestamp: { type: Date, default: Date.now },
    },
  ],
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  resolvedAt: Date,
});

module.exports = mongoose.model("Incident", IncidentSchema);
