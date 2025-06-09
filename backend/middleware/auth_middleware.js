const jwt = require("jsonwebtoken");
const SECRET = "your_jwt_secret";

function Auth(req,res,next) {
  next();
}

//for testing purposes, you can uncomment the following code to enable JWT authentication
// function Auth(req, res, next) {
//   const token = req.header("Authorization");
//   if (!token) return res.status(401).json({ msg: "No token. Auth denied." });

//   try {
//     const decoded = jwt.verify(token.split(" ")[1], SECRET);
//     req.user = decoded;
//     next();
//   } catch {
//     res.status(401).json({ msg: "Token invalid" });
//   }
// };

module.exports = {Auth};
