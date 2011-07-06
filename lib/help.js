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
	help = [
		'Available Commands',
		'------------------'
	];
	var tasks = this.bot.getRoomTasks(request.room);
	var taskHelp = tasks.map(function (task) {
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
