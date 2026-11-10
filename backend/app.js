const express = require("express");
const cors = require("cors");
const tripRouter = require("./trips/trip_router.js");
const blogRouter = require("./blogs/blog_router.js");
const userRouter = require("./user/auth_router.js");
const chatRouter = require("./Chatbox/chat_route.js");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", userRouter);
app.use("/trip", tripRouter);
app.use("/blogs", blogRouter);
app.use("/api/chat", chatRouter);

module.exports = app;
