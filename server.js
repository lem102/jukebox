import { Server } from "socket.io";

const io = new Server(3000);

let queue = [];
let locked = false;

const send = (message) => {
  io.emit("message", message);
};

const maybeSendNextTrack = (socket) => {
  if (!locked && queue.length > 0) {
    locked = true;
    send({ type: "url", data: queue.shift() });
  }
};

const skipCurrentTrack = (socket) => {
  locked = false;
  send({ type: "skip" });
};

io.on("connection", (socket) => {
  socket.on("message", (message) => {
    console.log({ message, queue });
    const { type, data } = message;
    switch (type) {
      case "nextSong":
        locked = false;
        maybeSendNextTrack(socket);
        break;
      case "queueSong":
        queue.push(data);
        maybeSendNextTrack(socket);
        break;
      case "skipSong":
        skipCurrentTrack(socket);
        break;
      case "listSongs":
       send({ type: "list", data: queue });
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
