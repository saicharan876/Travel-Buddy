const express = require("express");
const router = express.Router();
const Message = require("./chat_model.js");

router.get("/:tripId", async (req, res) => {
  try {
    const messages = await Message.find({ tripId: req.params.tripId }).sort("timestamp");
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

module.exports = router;
