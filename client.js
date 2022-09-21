import Mpv from "mpv";
import { io } from "socket.io-client";
import { prompt } from "./prompt.js";
import { searchYoutube } from "./searchYoutube.js";

const socket = io("ws://192.168.1.110:3000");
// const socket = io("ws://localhost:3000");

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

const skipCurrent = () => {
  mpv.command("stop");
};

mpv.on("end-file", () => {
  socket.send({ type: "nextSong" });
});

socket.on("message", (message) => {
  console.log("message received");
  console.log(message);
  const { type, data } = message;
  switch (type) {
    case "url":
      playNext(data);
      break;
    case "skip":
      skipCurrent();
      break;
    case "list":
      console.log(data);
      break;
  }
});

const parseInput = (input) => {
  if (input.includes(" ")) {
    const [, command, args] = input.match(/([a-z]+) (.+)/);
    return { command, args };
  }
  return { command: input };
};

const play = async (args) => {
  if (!args) {
    console.log("play requires an argument");
    return;
  }
  return /^http?s:\/\//.test(args) ? args : await searchYoutube(args);
};

const main = async () => {
  while (true) {
    const input = (await prompt("> ")).trim();
    const { command, args } = parseInput(input);
    switch (command) {
      case "play":
        console.log("sending play command");
        socket.send({ type: "queueSong", data: await play(args) });
        break;
      case "skip":
        socket.send({ type: "skipSong" });
        break;
      case "list":
        socket.send({ type: "listSongs" });
        break;
      default:
        console.log(`unrecognised command ${command} with args ${args}`);
    }
  }
};

main();
