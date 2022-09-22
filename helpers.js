import readline from "readline";
import fetch from "node-fetch";

export const searchYoutube = async (input) => {
  const youtubeUrl = "https://www.youtube.com/results?search_query=";
  const searchQuery = input.replace(" ", "+");
  const response = await fetch(youtubeUrl + searchQuery);
  const body = await response.text();

  const [videoId] = body.match(/\/watch\?v=.{0,11}/);
  return `https://www.youtube.com${videoId}`;
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

export const prompt = (query) => new Promise((resolve) => rl.question(query, resolve));

export const parseInput = (input) => {
  if (input.includes(" ")) {
    const [, command, args] = input.match(/([a-z]+) (.+)/);
    return { command, args };
  }
  return { command: input };
};

export const parsePlayArgs = async (args) => {
  if (!args) {
    console.log("play requires an argument");
    return;
  }
  return /^http?s:\/\//.test(args) ? args : await searchYoutube(args);
};

