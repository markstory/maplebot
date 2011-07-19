// The main bot object.  Uses a client object to listen
// to events and run the appropriate command method.

var Bot = function (config) {
	this.commands = {};
	this.tasks = [];
	this.taskMap = {};
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
		var bot = this;

		Object.keys(this.config.tasks).forEach(function (task) {
			bot.addTask(task);
		});
	},

	addTask: function (task) {
		var config = this.config,
			commands = this.commands,
			tasks = this.tasks,
			mod, taskObject, taskConfig = {};
	
		try {
			if (typeof(config.tasks[task]) === 'string') {
				moduleName = config.tasks[task];
			}
			if (typeof(config.tasks[task]) === 'object' && config.tasks[task] !== null) {
				if (!config.tasks[task].module) {
					throw new Error('No module property, cannot load task.');
				}
				taskConfig = config.tasks[task];
				moduleName = taskConfig.module
				delete taskConfig.module;
			}
			mod = require(moduleName)
		} catch (e) {
			throw new Error('Could not load module ' + config.tasks[task] + e.message);
		}
		if (!mod[task]) {
			throw new Error('Could not find task ' + task + ' in module ' + config.tasks[task]);
		}
		commands[task] = {};
		taskObject = new mod[task](this, taskConfig);
		taskObject.bindCommands(commands[task]);
		tasks[task] = taskObject;
	},

	getTask: function (name) {
		if (this.tasks[name] !== undefined) {
			return this.tasks[name]
		}
		throw new Error('No task of that name found');
	},

	handleMessage: function (request) {
		var response = '',
			tasks = this.getRoomTasks(request.room);

		for (var i = 0, len = tasks.length; i < len; i++) {
			var task = tasks[i],
				commands = this.commands[task];
			for (var c in commands) {
				if (!commands.hasOwnProperty(c)) {
					continue;
				}
				// commands must be at the start of a message.
				if (request.body.indexOf(c) !== 0) {
					continue;
				}
				request.body = request.body.substring(c.length).trim();
				response = commands[c](request);
				if (response) {
					return response;
				}
			}
		}
		return response;
	},

	getRoomTasks: function (room) {
		if (room && this.config.rooms && this.config.rooms[room]) {
			return this.config.rooms[room];
		}
		return Object.keys(this.commands);
	}
};

module.exports.Bot = Bot;
