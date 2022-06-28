const { wordCloudCallback } = require("./word-cloud");

module.exports.register = (app) => {
  app.shortcut("word_cloud", wordCloudCallback);
};
