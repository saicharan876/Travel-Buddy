const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  College: String,
  Job: String,
});

const UserModel =mongoose.model("User", userSchema);

module.exports = UserModel;