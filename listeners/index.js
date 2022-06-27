const commands = require("./commands");

module.exports.registerListeners = (app) => {
  commands.register(app);
};
