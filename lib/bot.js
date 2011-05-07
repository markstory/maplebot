// The main bot object.  Uses a client object to listen
// to events and run the appropriate command method.

var Bot = function (config) {
	this.config = config;
	this.configureTasks();
};

Bot.prototype = {

	commands: {},

	// Take the tasks from the config information and create
	// the correct task objects.
	configureTasks: function () {
		if (!this.config || !this.config.tasks) {
			throw new Error('No configured tasks.');
		}
		var config = this.config,
			commands = this.commands;

		Object.keys(this.config.tasks).forEach(function (task) {
			var mod, taskObject;
			try {
				mod = require(config.tasks[task]);
			} catch (e) {
				throw new Error('Could not load module ' + config.tasks[task]);
			}
			if (!mod[task]) {
				throw new Error('Could not find task ' + task + ' in module ' + config.tasks[task]);
			}
			taskObject = new mod[task]();
			taskObject.bindCommands(commands);
		});
	},

	handleMessage: function (message) {
		var response = '';
		for (var c in this.commands) {
			if (this.commands.hasOwnProperty(c) && message.indexOf(c) === 0) {
				var messageText = message.substring(c.length).trim();
				response = this.commands[c](messageText, response);
				if (response && response.length) {
					break;
				}
			}
		}
		return response;
	}
};

module.exports.Bot = Bot;
