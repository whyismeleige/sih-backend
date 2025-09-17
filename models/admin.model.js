const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const AdminSchema = new mongoose.Schema({
  email: {
    type: String,
    trim: true,
    lowercase: true,
    required: true,
  },
  password: {
    type: String,
    length: [8, "Password should be at least 8 characters long"],
    required: true,
    select: false,
  },
  status: {
    type: String,
    enum: ["online", "offline", "do_not_disturb"],
    default: "offline",
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization",
  },
  lastSeen: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

AdminSchema.index({ email: 1 });

AdminSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

AdminSchema.pre("save", async function (next) {
  if (this.isNew() || this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

module.exports = mongoose.model("Admin", AdminSchema);
