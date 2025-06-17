const mongoose = require("mongoose");

const TripModelSchema = new mongoose.Schema({
  destination: { type: String, required: true },
  description: { type: String },
  location: { type: String },
  college: { type: String },
  date: { type: Date, required: true },
  genderPreference: { type: String, enum: ["Male", "Female", "Any"] },
  blind: { type: Boolean, default: false },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
}, {
  timestamps: true 
});

const TripModel = mongoose.model('Trip', TripModelSchema);

module.exports = TripModel;
