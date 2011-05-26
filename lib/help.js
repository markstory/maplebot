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

Help.prototype.show = function () {
	help = [
		'Available Commands',
		'------------------'
	];
	var taskHelp = this.bot.tasks.map(function (task) {
		switch (typeof task.help) {
			case 'string':
				return '\n' + task.help;
			case 'function':
				return '\n' + task.help();
		}
	});
	return help.concat(taskHelp).join('\n');
};
