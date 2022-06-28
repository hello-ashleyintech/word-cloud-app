const axios = require("axios");
const fs = require("fs");

/**
 * Gets the conversation history of a specified date range using the
 * conversations.history API method called using the Slack Client.
 * When the endpoint is called, the default # of responses returned is 100.
 * @param  {Slack Client object} client | An instance of the Slack API client
 * @param  {object} body | An object to specify params for the conversations.history API request.
 * Find more info on required + optional params for this request here: https://api.slack.com/methods/conversations.history
 * @return {object} result | The resulting API response from Slack.
 * Lists all messages under the "message" property of the response.
 */
async function getConversationHistory(client, body) {
  const result = await client.conversations.history(body);
  return result;
}

/**
 * Uploads an inputted file to the Slack channel specified.
 * @param  {File object} file | An object representing a file contents - in this case, a PNG for the word cloud.
 * @param  {string} channel | The Channel ID of the channel where messages are being read.
 * @param  {Slack Client object} client | An instance of the Slack API client
 */
async function uploadFile(file, channel, client) {
  client.files
  .upload({
    token: process.env.SLACK_BOT_TOKEN,
    channels: channel,
    file: file,
    filename: "word-cloud.png",
    filetype: "png",
    mimetype: "image/png",
  })
  .catch((error) => {
    console.log(error);
  });
}

/**
 * Takes the result object of a conversations.history API client request and compiles all user-sent
 * messages into an inputted string.
 * @param  {object} result | The resulting API response from Slack.
 * @param  {string} channelText | An inputted string containing all text from currently parsed user-sent messages.
 * @return {string} channelText | The resulting string adding in newly parsed text to channelText, which reflected
 * text from all currently parsed user-sent messages made from the request.
 */
function buildMessageString(result, channelText) {
  if (result.messages && result.messages.length > 0) {
    let firstWord = true;
    result.messages.map((message) => {
      // Map through and check if each item has a `client_msg_id` (meaning it's for a user) - omits bot and app messages
      if (message.client_msg_id) {
        if (firstWord) {
          channelText = channelText + message.text;
          firstWord = false;
        } else {
          channelText = channelText + " " + message.text;
        }
      }
    });
  }
  return channelText;
}

/**
 * Takes the result object of a conversations.history API client request and compiles all user-sent
 * messages into an inputted string.
 * @param  {Slack Client object} client | An instance of the Slack API client.
 * @param  {string} channel | The Channel ID of the channel where messages are being read.
 * @param  {object} result | The original (first) result of a conversation history - will also indicate
 * if there is more to paginate through if this result has a response_metadata.next_cursor property.
 * @param  {UNIX Timestamp} oldest | The oldest date that messages are being queried from.
 * @param  {UNIX Timestamp} latest | The latest date that messages are being queried from.
 * @return {string} channelText | The resulting string adding in newly parsed text to channelText, which reflected
 * text from all currently parsed user-sent messages made from the request.
 */
async function generateWordCloudString(
  client,
  channel,
  result,
  oldest,
  latest
) {
  let channelText = "";

  channelText = buildMessageString(result, channelText);

  if (result.response_metadata.next_cursor) {
    let paginateRequest = true;

    while (paginateRequest) {
      let body = {
        token: process.env.SLACK_BOT_TOKEN,
        channel: channel,
        oldest: oldest,
        latest: latest,
        inclusive: true,
        cursor: result.response_metadata.next_cursor,
        limit: 100,
      };

      let nextResult = await getConversationHistory(client, body);
      channelText = buildMessageString(nextResult, channelText);

      if (!nextResult.response_metadata.next_cursor) {
        paginateRequest = false;
      } else {
        result = nextResult;
        channelText += " ";
      }
    }
  }
  return channelText;
}

/**
 * Generates and uploads a word cloud using the Word Cloud API.
 * Word Cloud API docs can be found here: https://quickchart.io/documentation/word-cloud-api/
 *
 * @param  {string} channelText | An inputted string containing all text from currently parsed user-sent messages.
 * @param  {string} channel | The Channel ID of the channel where messages are being read.
 * @param  {Slack Client object} client | An instance of the Slack API client.
 */
async function generateWordCloud(channelText, channel, client) {
  // Set up data for Word Cloud API
  let data = {
    format: "png",
    width: 500,
    height: 500,
    fontFamily: "sans-serif",
    fontScale: 15,
    scale: "linear",
    text: channelText,
  };

  await axios
    .post("https://quickchart.io/wordcloud", JSON.stringify(data), {
      headers: {
        "Content-Type": "application/json",
      },
      responseType: "arraybuffer",
    })
    .then((res) => {
      // Read in binary file that QuickChat API returns and convert to base64
      let data = Buffer.from(res.data, "binary").toString("base64");

      // Write + save this converted image to a file
      fs.writeFile("word-cloud.png", data, "base64", (err) => {
        console.log(err);
      });

      // Read this file and then upload to Slack using the client
      let file = fs.createReadStream("." + "/word-cloud.png");
      uploadFile(file, channel, client);
    });
}

module.exports = {
  getConversationHistory,
  generateWordCloudString,
  generateWordCloud,
};
