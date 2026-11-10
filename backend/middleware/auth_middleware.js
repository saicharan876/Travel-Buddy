const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config.js");

function readToken(req) {
  const header = req.header("Authorization");
  if (!header || !header.startsWith("Bearer ")) {
    return null;
  }
  return header.split(" ")[1];
}

function Auth(req, res, next) {
  const token = readToken(req);
  if (!token) {
    return res.status(401).json({ msg: "No token. Auth denied." });
  }
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ msg: "Token invalid or expired" });
  }
}

function OptionalAuth(req, res, next) {
  const token = readToken(req);
  if (token) {
    try {
      req.user = jwt.verify(token, JWT_SECRET);
    } catch {
      req.user = undefined;
    }
  }
  next();
}

module.exports = { Auth, OptionalAuth };
