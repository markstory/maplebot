var task = require('./task'),
	util = require('util');

// A simple task that allows you to control and display a queue
// of hotfixes to be deployed.
var QueueManager = function () {
	this.queue = [];
	this.type = 'Hotfix';
};
exports.QueueManager = QueueManager;
util.inherits(QueueManager, task.Task);

QueueManager.prototype.commands = {
	'!qadd': 'add',
	'!qrm': 'remove',
	'!qls': 'show',
	'!next': 'next',
	'!queue-add': 'add',
	'!queue-remove': 'remove',
	'!queue-show': 'show'
};

QueueManager.prototype.add = function (ticket) {
	ticket = ticket.trim();
	if (ticket.length > 0) {
		this.queue.push(ticket);
		return this.show();
	}
	return 'No item found, nothing added.';
}

QueueManager.prototype.remove = function () {
	this.queue.shift();
	return this.show();
};

QueueManager.prototype.next = function (ticket) {
	ticket = ticket.trim();
	var from = this.queue.indexOf(ticket);
	if (from != -1) {
		this.queue.splice(from, 1);
	}
	this.queue.unshift(ticket);
	return this.show();
}

QueueManager.prototype.show = function () {
	var text, 
		queue = this.queue;

	if (this.queue.length === 0) {
		return 'The ' + this.type + ' queue is empty, well done!';
	}
	return this.type + ' queue is: [' + queue.join(', ') + ']';
};



