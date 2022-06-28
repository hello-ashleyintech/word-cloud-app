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
 * @param  {object} result | The resulting API response from Slack.
 * @param  {string} channelText | An inputted string containing all text from currently parsed user-sent messages.
 * @return {string} channelText | The resulting string adding in newly parsed text to channelText, which reflected
 * text from all currently parsed user-sent messages made from the request.
 */
async function generateWordCloudString(
  client,
  command,
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
        channel: command.channel_id,
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
 * General callback and main functionality for pulling conversation data from Slack, passing it into
 * the Word Cloud API, and then posting the word cloud in the specified channel.
 *
 * Word Cloud API docs can be found here: https://quickchart.io/documentation/word-cloud-api/
 */
const wordCloudCallback = async ({ command, ack, say, client }) => {
  try {
    await ack();
    let textArray = command.text.split(" ");
    let textOldestDate = textArray[0] ? textArray[0] : "the past 30 days";
    let textLatestDate = textArray[1] ? textArray[1] : "today";
    await say(
      `Hi, <@${command.user_name}>! We are generating a word cloud for you from ${textOldestDate} to ${textLatestDate}. Hang tight!`
    );

    // If latest date is not provided, default to today's timestamp
    let latest = textArray[1] ? new Date(textArray[1]) : new Date();
    // If oldest date is not provided, default to 30 days prior to today's timestamp
    let oldest = textArray[0]
      ? new Date(textArray[0])
      : new Date(new Date().setDate(latest.getDate() - 30));

    // Convert provided dates to UNIX timestamp to make them API-friendly
    oldest = Math.floor(oldest.getTime() / 1000);
    latest = Math.floor(latest.getTime() / 1000);

    // Make sure oldest date really is older than the latest date provided
    if (oldest && latest && oldest < latest) {
      let body = {
        token: process.env.SLACK_BOT_TOKEN,
        channel: command.channel_id,
        oldest: oldest,
        latest: latest,
        inclusive: true,
        limit: 100,
      };

      // Call API request to get conversation history
      let result = await getConversationHistory(client, body);

      if (result.messages && result.messages.length > 0) {
        // If API result is not empty, proceed to generating a string to pass into the word cloud
        // and also check for and query more results via API pagination if applicable
        let channelText = await generateWordCloudString(
          client,
          command,
          result,
          oldest,
          latest
        );

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
            client.files
              .upload({
                token: process.env.SLACK_BOT_TOKEN,
                channels: command.channel_id,
                file: file,
                filename: "word-cloud.png",
                filetype: "png",
                mimetype: "image/png",
              })
              .catch((error) => {
                console.log(error);
              });
          });
      } else {
        // Throw error for an invalid date range (ex: oldest date > latest)
        await say(
          `Sorry, <@${command.user_name}>! We couldn't find any messages in that date range to create a word cloud. Please try again!`
        );
      }
    } else {
      // Throw error for an invalid date (ex: date provided in a text format like Jan 01, 2022 rather than MM-DD-YYYY or YYYY-MM-DD)
      await say(
        `Sorry, <@${command.user_name}>! That is an invalid date range. Please use /word-cloud [YYYY-MM-DD of oldest date] [YYYY-MM-DD of latest date] to specify your range and try again!`
      );
    }
  } catch (error) {
    // Throw error for all other API errors that may occur
    console.error(error);
    await say(
      `Sorry, <@${command.user_name}>! There was an error. Please try again!`
    );
  }
};

module.exports = { wordCloudCallback };
