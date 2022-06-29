const wordCloudFunctions = require("../../functions/word-cloud-functions.js");

/**
 * General commands callback and main functionality for pulling conversation data from Slack, passing it into
 * the Word Cloud API, and then posting the word cloud in the specified channel.
 */
const wordCloudCallback = async ({ command, ack, say, client }) => {
  try {
    await ack();
    let textArray = command.text.split(" ");
    let textOldestDate = textArray[0] ? textArray[0] : "the past 30 days";
    let textLatestDate = textArray[1] ? textArray[1] : "today";
    const channel = command.channel_id;

    await say(
      `Hi, <@${command.user_id}>! We are generating a word cloud for you from ${textOldestDate} to ${textLatestDate}. Hang tight!`
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
        channel: channel,
        oldest: oldest,
        latest: latest,
        inclusive: true,
        limit: 100,
      };

      // Call API request to get conversation history
      let result = await wordCloudFunctions.getConversationHistory(
        client,
        body
      );

      if (result.messages && result.messages.length > 0) {
        // If API result is not empty, proceed to generating a string to pass into the word cloud
        // and also check for and query more results via API pagination if applicable
        let channelText = await wordCloudFunctions.generateWordCloudString(
          client,
          channel,
          result,
          oldest,
          latest
        );

        await wordCloudFunctions.generateWordCloud(
          channelText,
          channel,
          client
        );
      } else {
        // Throw error for an invalid date range (ex: oldest date > latest)
        await say(
          `Sorry, <@${command.user_id}>! We couldn't find any messages in that date range to create a word cloud. Please try again!`
        );
      }
    } else {
      // Throw error for an invalid date (ex: date provided in a text format like Jan 01, 2022 rather than MM-DD-YYYY or YYYY-MM-DD)
      await say(
        `Sorry, <@${command.user_id}>! That is an invalid date range. Please use /word-cloud [YYYY-MM-DD of oldest date] [YYYY-MM-DD of latest date] to specify your range and try again!`
      );
    }
  } catch (error) {
    // Throw error for all other API errors that may occur
    console.error(error);
    await say(
      `Sorry, <@${command.user_id}>! There was an error. Please try again!`
    );
  }
};

module.exports = { wordCloudCallback };
