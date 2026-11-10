const express = require("express");
const { signup, login, getUser, updateProfilePhoto, getUserIdByUsername } = require("../user/auth_controller.js");
const { Auth } = require("../middleware/auth_middleware");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/user/:id", Auth, getUser);
router.put("/user/:id/update-photo-url", Auth, updateProfilePhoto);
router.get("/by-username/:username", Auth, getUserIdByUsername);

module.exports = router;
