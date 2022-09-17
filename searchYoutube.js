import fetch from "node-fetch";

export const searchYoutube = async (input) => {
  const youtubeUrl = "https://www.youtube.com/results?search_query=";
  const searchQuery = input.replace(" ", "+");
  const response = await fetch(youtubeUrl + searchQuery);
  const body = await response.text();

  const [videoId] = body.match(/\/watch\?v=.{0,11}/);
  return `https://www.youtube.com${videoId}`;
};
