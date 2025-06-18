const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    profilePhoto: {
      type: String,
      default: "",
      validate: {
        validator: function (v) {
          return /^https?:\/\/.+|^uploads\/.+/.test(v) || v === "";
        },
        message: props => `${props.value} is not a valid image path or URL!`
      }
    },
    College: String,
    Job: String,
  },
  { timestamps: true }
);

const UserModel = mongoose.model("User", userSchema);

module.exports = UserModel;
