const { wordCloudCallback } = require("./word-cloud");

module.exports.register = (app) => {
  app.command("/word-cloud", wordCloudCallback);
};
