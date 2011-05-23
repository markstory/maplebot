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
	var help = this.bot.tasks.map(function (task) {
		switch (typeof task.help) {
			case 'string':
				return task.help;
			case 'function':
				return task.help();
		}
	});
	return help.join('\n');
};
