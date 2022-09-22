import { Server } from "socket.io";

const io = new Server(3000);

let queue = [];
let playing = false;
let connections = 0;
let loaded = 0;

const send = (message) => {
  io.emit("message", message);
};

const maybeSendNextTrack = () => {
  if (!playing && queue.length > 0) {
    playing = true;
    send({ type: "url", data: queue.shift() });
  }
};

io.on("connection", (socket) => {
  connections++;
  console.log(`client connected; now there are ${connections} connections.`);
  socket.on("message", (message) => {
    console.log({ message, queue });
    const { type, data } = message;
    switch (type) {
      case "nextSong":
        playing = false;
        maybeSendNextTrack();
        break;
      case "queueSong":
        queue.push(data);
        maybeSendNextTrack();
        break;
      case "skipSong":
        playing = false;
        send({ type: "skip" });
        break;
      case "listSongs":
        send({ type: "list", data: queue });
        break;
      case "loaded":
        loaded++;
        if (loaded >= connections) {
          loaded = 0;
          send({ type: "play" });
        }
        break;
      default:
        console.log(`unrecognised message type ${type}`);
    }
  });

  socket.on("disconnect", (reason) => {
    connections--;
    console.log(
      `client disconnected; now there are ${connections} connections.`,
    );
    if (io.engine.clientsCount <= 0) {
      playing = false;
    }
  });
});
