const mongoose = require("mongoose");

const TripModelSchema = new mongoose.Schema({
  destination: String,
  description: String,
  location: String,
  date: Date,
  genderPreference: String,
  blind: Boolean,
//   creator: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
//   participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

const TripModel = mongoose.model('Trip',TripModelSchema);

module.exports = TripModel;

