var task = require('.task'),
	util = require('util');

var Help = function () {

};
util.inherits(Help, task.Task);
exports.Help = Help;

Help.prototype.commands = {
	'!help': 'show'
};

Help.prototype.show = function () {
	return 'Help is coming soon, I promise.';
};
