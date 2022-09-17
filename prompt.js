import readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

export const prompt = (query) => new Promise((resolve) => rl.question(query, resolve));
