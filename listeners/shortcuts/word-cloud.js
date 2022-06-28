const wordCloudCallback = async ({ shortcut, ack, client }) => {
  try {
    const { trigger_id } = shortcut;

    await ack();

    await client.views.open({
      trigger_id,
      view: {
        type: "modal",
        callback_id: "word_cloud",
        title: {
          type: "plain_text",
          text: "Generate a Word Cloud ☁️",
        },
        blocks: [
          {
            type: "input",
            optional: true,
            block_id: "oldest_date_block_id",
            label: {
              type: "plain_text",
              text: "Oldest Date [YYYY-MM-DD]",
            },
            element: {
              type: "plain_text_input",
              action_id: "oldest_date_id",
              multiline: false,
            },
          },
          {
            type: "input",
            optional: true,
            block_id: "newest_date_block_id",
            label: {
              type: "plain_text",
              text: "Newest Date [YYYY-MM-DD]",
            },
            element: {
              type: "plain_text_input",
              action_id: "newest_date_id",
              multiline: false,
            },
          },
          {
            block_id: "select_channel_block_id",
            type: "input",
            label: {
              type: "plain_text",
              text: "Select a channel to message the result to",
            },
            element: {
              type: "conversations_select",
              action_id: "channel_select_id",
              response_url_enabled: true,
            },
          },
        ],
        submit: {
          type: "plain_text",
          text: "Submit",
        },
      },
    });
  } catch (error) {
    console.error(error);
  }
};

module.exports = { wordCloudCallback };
