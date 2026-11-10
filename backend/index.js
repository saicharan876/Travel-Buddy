const http = require("http");
const { Server } = require("socket.io");
const { MONGO_URI, PORT } = require("./config.js");
const app = require("./app.js");
const connectDB = require("./connect.js");
const setupChat = require("./Chatbox/chat_socket.js");

connectDB(MONGO_URI);

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
});

setupChat(io);

server.listen(PORT, () => console.log(`Server is running at port: ${PORT}`));
