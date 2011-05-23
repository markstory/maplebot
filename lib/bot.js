// The main bot object.  Uses a client object to listen
// to events and run the appropriate command method.

var Bot = function (config) {
	this.commands = {};
	this.tasks = [];
	this.config = config;
	this.configureTasks();
};

Bot.prototype = {

	// Take the tasks from the config information and create
	// the correct task objects.
	configureTasks: function () {
		if (!this.config || !this.config.tasks) {
			throw new Error('No configured tasks.');
		}
		var config = this.config,
			commands = this.commands,
			tasks = this.tasks;

		Object.keys(this.config.tasks).forEach(function (task) {
			var mod, taskObject;
			try {
				mod = require(config.tasks[task]);
			} catch (e) {
				throw new Error('Could not load module ' + config.tasks[task] + e.message);
			}
			if (!mod[task]) {
				throw new Error('Could not find task ' + task + ' in module ' + config.tasks[task]);
			}
			taskObject = new mod[task]();
			taskObject.bindCommands(commands);
			tasks.push(taskObject);
		});
	},

	handleMessage: function (message) {
		var response = '';
		for (var c in this.commands) {
			if (this.commands.hasOwnProperty(c) && message.indexOf(c) === 0) {
				var messageText = message.substring(c.length).trim();
				response = this.commands[c](messageText, response);
				if (response) {
					break;
				}
			}
		}
		return response;
	}
};

module.exports.Bot = Bot;
