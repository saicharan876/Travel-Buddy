const express = require("express");
const { signup, login,getUser,updateProfilePhoto } = require('../user/auth_controller.js');
const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get('/user/:id',getUser);
router.put("/user/:id/update-photo-url", updateProfilePhoto);


module.exports = router;
