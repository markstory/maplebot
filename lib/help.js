var task = require('./task'),
	util = require('util');

var Help = function (bot) {
	this.bot = bot;
};
util.inherits(Help, task.Task);
exports.Help = Help;

Help.prototype.commands = {
	'!help': 'show'
};

Help.prototype.show = function (request) {
	var help = [
		'Available Commands',
		'------------------'
	];
	var tasks = this.bot.getRoomTasks(request.room);
	var bot = this.bot;
	var taskHelp = tasks.map(function (taskName) {
		task = bot.getTask(taskName);
		switch (typeof task.help) {
			case 'string':
				return '\n' + task.help;
			case 'function':
				var value = task.help();
				if (value !== undefined) {
					return '\n' + value;
				}
				return '';
		}
	});
	return help.concat(taskHelp).join('\n');
};
