const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const tripRouter = require('./trips/trip_router.js'); 
const blogRouter = require('./blogs/blog_router.js');
const userRouter = require('./user/auth_router.js');
const chatRouter = require('./Chatbox/chat_route.js');
const ChatMessage = require('./Chatbox/chat_model.js'); 
const connectDB = require('./connect.js');
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB("mongodb://localhost:27017/Trip-Buddy");


app.use('/', userRouter);
app.use('/trip', tripRouter);
app.use('/blogs', blogRouter);
app.use('/api/chat', chatRouter);



const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});


io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("joinRoom", ({ roomId }) => {
    socket.join(roomId);
  });

  socket.on("sendMessage", async ({ roomId, message, senderId, receiverId }) => {
    const newMessage = new ChatMessage({ tripId: roomId, senderId, receiverId, message });
    await newMessage.save();

    io.to(roomId).emit("receiveMessage", {
      message,
      senderId,
      receiverId,
      timestamp: newMessage.timestamp,
    });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(PORT, () => console.log(`Server is running at port: ${PORT}`));
