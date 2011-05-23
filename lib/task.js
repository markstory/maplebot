var events = require('events'),
	util = require('util');

// Base object for bot tasks.
// Extending this object gives you command binding for free
var Task = function (bot) {
	this.bot = bot;
};

Task.prototype = {
	// The command -> function mappings for this bot task.
	commands: {},
	// write some help return a string of this bot task's help.
	help: function () {
	
	},
	bindCommands: function (commandList) {
		var _this = this;
		Object.keys(this.commands).forEach(function (k) {
			var funcName = _this.commands[k];
			commandList[k] = _this[funcName].bind(_this);
		});
		return commandList;
	}
};

exports.Task = Task;


// Promises used by the bot to send messages that depend
// on async work.
var Promise = function () {
	events.EventEmitter.call(this);
	this.hasFired = false;
	this.args = undefined;
};
util.inherits(Promise, events.EventEmitter);
exports.Promise = Promise;

Promise.prototype.resolve = function () {
	if (this.hasFired) {
		return;
	}
	this.hasFired = 'resolve';
	this.args = Array.prototype.slice.call(arguments);
	this.emit.apply(this, ['resolve'].concat(this.args));
};

Promise.prototype.reject = function () {
	if (this.hasFired) {
		return;
	}
	this.hasFired = 'reject';
	this.args = Array.prototype.slice.call(arguments);
	this.emit.apply(this, ['reject'].concat(this.args));
};

Promise.prototype.when = function (success, error) {
	if (this.hasFired === 'resolve') {
		success.apply(this, this.args);
	} else if (this.hasFired === 'reject' && error) {
		error.apply(this, this.args);
	}
	this.addListener('resolve', success);
	if (error) {
		this.addListener('error', error);
	}
};


