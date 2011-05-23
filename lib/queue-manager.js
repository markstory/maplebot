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
	'!qnext': 'next',
	'!qdelay': 'delay'
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
		text = 'The ' + this.type + ' queue is empty, well done!';
		return {body: text, subject: text};
	}
	text = this.type + ' queue is: [' + queue.join(', ') + ']';
	return {body: text, subject: text};
};

QueueManager.prototype.delay = function (ticket) {
	var text = '';
	ticket = ticket.trim();
	var from = this.queue.indexOf(ticket);
	if (from == -1) {
		text = ticket + ' not in queue; did you mean !qadd ' + ticket + '?';
		return {body: text, subject: text};
	} else if (from < this.queue.length - 1) {
		var temp = this.queue[from];
		this.queue[from] = this.queue[from + 1];
		this.queue[from + 1] = temp;
	}
	return this.show();
}

QueueManager.prototype.help = function() {
	return [
		'QueueManager',
		'------------',
		'!qadd <ticket>: Add to the end of the queue.',
		'!qrm: Shift off the front of the queue.',
		'!qls: Display the queue.',
		'!qnext <ticket>: Make the provided ticket first in the queue.',
		'!qdelay <ticket>: Move the provided ticket to the end of the queue.'
	].join('\n');
};
