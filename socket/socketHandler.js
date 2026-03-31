const {Server} = require("socket.io");
let io;

function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("disconnect", async () => {
    console.log("Client disconnected:", socket.id);
  });
  });
}

function getIO() {
  if (!io) throw new Error("Socket.io chưa được khởi tạo");
  return io;
}

module.exports = { initSocket, getIO };