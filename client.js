import * as dotenv from "dotenv";
dotenv.config();

import Mpv from "mpv";
import { io } from "socket.io-client";
import { parseInput, parsePlayArgs, prompt } from "./helpers.js";

const socket = io(process.env.SERVER_URL);

const mpv = Mpv({
  args: ["--no-video"],
  options: {},
  path: "mpv",
});

const loadNext = async (url) => {
  mpv.command(
    "loadfile",
    url,
  );
  await mpv.set("pause", true);
};

const skipCurrent = () => {
  mpv.command("stop");
};

const play = async () => {
  await mpv.set("pause", false);
};

mpv.on("start-file", () => {
  socket.send({ type: "loaded" });
});

mpv.on("end-file", () => {
  socket.send({ type: "nextSong" });
});

socket.on("message", (message) => {
  console.log("message received");
  console.log(message);
  const { type, data } = message;
  switch (type) {
    case "url":
      loadNext(data);
      break;
    case "skip":
      skipCurrent();
      break;
    case "list":
      console.log(data);
      break;
    case "play":
      play();
      break;
  }
});

const main = async () => {
  while (true) {
    const input = (await prompt("> ")).trim();
    const { command, args } = parseInput(input);
    switch (command) {
      case "play":
        console.log("sending play command");
        socket.send({ type: "queueSong", data: await parsePlayArgs(args) });
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
