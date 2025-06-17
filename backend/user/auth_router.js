const express = require("express");
const { signup, login,getUser } = require('../user/auth_controller.js');
const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get('/user/:id',getUser);


module.exports = router;
