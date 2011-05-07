var Task = require('./task'),
	util = require('util');

// A simple task that allows you to control and display a queue
// of hotfixes to be deployed.
var QueueManager = function () {
	this.queue = [];
	this.type = 'Hotfix';
};
exports.QueueManager = QueueManager;
util.inherits(QueueManager, Task);

QueueManager.prototype.commands = {
	'!qadd': 'add',
	'!qrm': 'remove',
	'!qls': 'show',
	'!queue-add': 'add',
	'!queue-remove': 'remove',
	'!queue-show': 'show'
};

QueueManager.prototype.add = function (ticket, response) {
	ticket = ticket.trim();
	if (ticket.length > 0) {
		this.queue.push(ticket);
		return this.show('', response);
	}
	return 'No item found, nothing added.';
}

QueueManager.prototype.remove = function (nothing, response) {
	this.queue.shift();
	return this.show('', response);
};

QueueManager.prototype.show = function (nothing, response) {
	var text, 
		queue = this.queue;

	if (this.queue.length === 0) {
		return 'The ' + this.type + ' queue is empty, well done!';
	}
	return this.type + ' queue is: [' + queue.join(', ') + ']';
};



