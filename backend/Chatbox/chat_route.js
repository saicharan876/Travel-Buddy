const express = require("express");
const router = express.Router();
const Message = require("./chat_model.js");
const { Auth } = require("../middleware/auth_middleware");
const { findTripForMember, senderFor } = require("./chat_helpers.js");

router.get("/:tripId", Auth, async (req, res) => {
  try {
    const result = await findTripForMember(req.params.tripId, req.user.id);
    if (result.error) {
      return res.status(result.status).json({ error: result.error });
    }

    const messages = await Message.find({ tripId: req.params.tripId })
      .sort("timestamp")
      .populate("senderId", "name");

    const output = messages.map((m) => ({
      _id: m._id,
      message: m.message,
      timestamp: m.timestamp,
      senderId: senderFor(result.trip, m.senderId),
    }));

    res.json(output);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

module.exports = router;
