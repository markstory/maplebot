var QueueManager = require('../lib/queue-manager').QueueManager,
	vows = require('vows'),
	assert = require('assert');

vows.describe('QueueManager Task').addBatch({
	'adding to the queue': {
		topic: function () {
			return new QueueManager();
		},

		'works when there is texts': function(topic) {
			var response = topic.add('1234');
			assert.equal('Hotfix queue is: [1234]', response);

			response = topic.add('567');
			assert.equal('Hotfix queue is: [1234, 567]', response);
		},

		'trims space off': function (topic) {
			var response = topic.add('   89  ');
			assert.equal('Hotfix queue is: [1234, 567, 89]', response);
		}
	},

	'removing from the queue': {
		topic: function () {
			return new QueueManager();
		},
		'shortens the list': function (topic) {
			topic.add('1234');
			var response = topic.remove();
			assert.equal('The Hotfix queue is empty, well done!', response);
		}

	}

}).export(module);
