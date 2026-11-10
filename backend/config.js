require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("JWT_SECRET is missing. Create backend/.env (see backend/.env.example).");
  process.exit(1);
}

module.exports = {
  JWT_SECRET,
  MONGO_URI: process.env.MONGO_URI || "mongodb://localhost:27017/Trip-Buddy",
  PORT: process.env.PORT || 5000,
  TOKEN_EXPIRY: "1d",
};
