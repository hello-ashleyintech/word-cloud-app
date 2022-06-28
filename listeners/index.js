const commands = require("./commands");
const shortcuts = require("./shortcuts");
const views = require("./views");

module.exports.registerListeners = (app) => {
  commands.register(app);
  shortcuts.register(app);
  views.register(app);
};
