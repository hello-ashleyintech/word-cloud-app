const { wordCloudViewCallback } = require("./word-cloud-view");

module.exports.register = (app) => {
  app.view("word_cloud", wordCloudViewCallback);
};
