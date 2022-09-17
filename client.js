import Mpv from "mpv";
import { io } from "socket.io-client";
import { prompt } from "./prompt.js";
import { searchYoutube } from "./searchYoutube.js";

const socket = io("ws://localhost:3000");

const mpv = Mpv({
  args: ["--no-video"],
  options: {},
  path: "mpv",
});

const playNext = (url) => {
  mpv.command(
    "loadfile",
    url,
  );
};

mpv.on("end-file", () => {
  socket.send({ type: "next" });
});

socket.on("message", (message) => {
  const { data } = message;
  playNext(data);
});

const main = async () => {
  while (true) {
    const input = await prompt("> ");
    const [, command, args] = input.match(/([a-z]+) (.+)/);
    switch (command) {
      case "play":
        const searchResult = await searchYoutube(args);
        socket.send({ type: "queueSong", data: searchResult });
        break;
      default:
        console.log(`unrecognised command ${command}`);
    }
  }
};

main();

// investigate deploying to raspberry pi
