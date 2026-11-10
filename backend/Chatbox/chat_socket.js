const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config.js");
const ChatMessage = require("./chat_model.js");
const User = require("../user/user_model.js");
const { findTripForMember, senderFor } = require("./chat_helpers.js");

const MAX_LENGTH = 1000;

function setupChat(io) {
  io.use((socket, next) => {
    const token = socket.handshake.auth && socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Unauthorized"));
    }
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    socket.on("joinRoom", async ({ roomId }) => {
      try {
        const result = await findTripForMember(roomId, socket.userId);
        if (result.error) {
          socket.emit("chatError", { message: result.error });
          return;
        }
        socket.join(roomId);
        socket.emit("joinedRoom", { roomId });
      } catch (err) {
        socket.emit("chatError", { message: "Could not join chat" });
      }
    });

    socket.on("sendMessage", async ({ roomId, message }) => {
      try {
        const text = typeof message === "string" ? message.trim() : "";
        if (!text || text.length > MAX_LENGTH) {
          socket.emit("chatError", { message: "Message must be 1 to 1000 characters" });
          return;
        }
        if (!socket.rooms.has(roomId)) {
          socket.emit("chatError", { message: "Join the trip chat first" });
          return;
        }

        const result = await findTripForMember(roomId, socket.userId);
        if (result.error) {
          socket.emit("chatError", { message: result.error });
          return;
        }

        const newMessage = new ChatMessage({
          tripId: roomId,
          senderId: socket.userId,
          receiverId: result.trip.creator,
          message: text,
        });
        await newMessage.save();

        const sender = await User.findById(socket.userId).select("name");

        io.to(roomId).emit("receiveMessage", {
          _id: newMessage._id,
          message: text,
          timestamp: newMessage.timestamp,
          senderId: senderFor(result.trip, sender || { _id: socket.userId }),
        });
      } catch (err) {
        socket.emit("chatError", { message: "Could not send message" });
      }
    });
  });
}

module.exports = setupChat;
