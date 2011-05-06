
var QueueManager = function () {
	this.queue = [];
};

QueueManager.prototype = {
	commands: {
		'!qadd': 'add',
		'!qrm': 'remove',
		'!qls': 'show',
		'!queue-add': 'add',
		'!queue-remove': 'remove',
		'!queue-show': 'show'
	},

	add: function (ticket, response) {
		ticket = ticket.trim();
		if (ticket.length > 0) {
			this.queue.push(ticket);
			return this.show('', response);
		}
		return 'No ticket found, nothing added.';
	},

	remove: function (nothing, response) {
		this.queue.shift();
		return this.show('', response);
	},

	show: function (nothing, response) {
		var text, 
			queue = this.queue;

		if (this.queue.length === 0) {
			return 'The Hotfix queue is empty, well done!';
		}
		return 'Hotfix queue is: [' + queue.join(', ') + ']';
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

exports.QueueManager = QueueManager;
