const wordCloudFunctions = require("../../functions/word-cloud-functions.js");

/**
 * General shortcut callback and main functionality for pulling conversation data from Slack, passing it into
 * the Word Cloud API, and then posting the word cloud in the specified channel.
 */
const wordCloudViewCallback = async ({ ack, view, body, client }) => {
  await ack();

  try {
    const formValues = view.state.values;
    const oldestDate = formValues.oldest_date_block_id.oldest_date_id.value;
    const newestDate = formValues.newest_date_block_id.newest_date_id.value;
    const channelSelector =
      formValues.select_channel_block_id.channel_select_id;

    let textOldestDate = oldestDate ? oldestDate : "the past 30 days";
    let textLatestDate = newestDate ? newestDate : "today";
    const channel = channelSelector.selected_conversation;

    client.chat.postMessage({
      channel: channel,
      text: `Hi, <@${body.user.id}>! We are generating a word cloud for you from ${textOldestDate} to ${textLatestDate}. Hang tight!`,
    });

    // If latest date is not provided, default to today's timestamp
    let latest = newestDate ? new Date(newestDate) : new Date();
    // If oldest date is not provided, default to 30 days prior to today's timestamp
    let oldest = oldestDate
      ? new Date(oldestDate)
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
        client.chat.postMessage({
          channel: channel,
          text: `Sorry, <@${body.user.id}>! We couldn't find any messages in that date range to create a word cloud. Please try again!`,
        });
      }
    } else {
      // Throw error for an invalid date (ex: date provided in a text format like Jan 01, 2022 rather than MM-DD-YYYY or YYYY-MM-DD)
      client.chat.postMessage({
        channel: channel,
        text: `Sorry, <@${body.user.id}>! That is an invalid date range. Please use /word-cloud [YYYY-MM-DD of oldest date] [YYYY-MM-DD of latest date] to specify your range and try again!`,
      });
    }
  } catch (error) {
    // Throw error for all other API errors that may occur
    console.error(error);
    client.chat.postMessage({
      channel: channel,
      text: `Sorry, <@${body.user.id}>! There was an error. Please try again!`,
    });
  }
};

module.exports = { wordCloudViewCallback };
