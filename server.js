import { Server } from "socket.io";

const io = new Server(3000);

let queue = [];
let locked = false;

const maybeSendNextTrack = (socket) => {
  if (!locked && queue.length > 0) {
    locked = true;
    socket.send({ type: "url", data: queue.shift() });
  }
};

io.on("connection", (socket) => {
  socket.on("message", (message) => {
    const { type, data } = message;
    switch (type) {
      case "next":
        locked = false;
        maybeSendNextTrack(socket);
        break;
      case "queueSong":
        queue.push(data);
        maybeSendNextTrack(socket);
        break;
      default:
        console.log(`unrecognised message type ${type}`);
    }
  });

  socket.on("disconnect", (reason) => {
    if (io.engine.clientsCount <= 0) {
      locked = false;
    }
  });
});
