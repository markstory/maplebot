// Base object for bot tasks.
// Extending this object gives you command binding for free
var Task = module.exports = function (bot) {
	this.bot = bot;
};
Task.prototype = {
	// The command -> function mappings for this bot task.
	commands: {},

	bindCommands: function (commandList) {
		var _this = this;
		Object.keys(this.commands).forEach(function (k) {
			var funcName = _this.commands[k];
			commandList[k] = _this[funcName].bind(_this);
		});
		return commandList;
	}
};
