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
			assert.equal('Hotfix queue is: [1234]', response.body);

			response = topic.add('567');
			assert.equal('Hotfix queue is: [1234, 567]', response.body);
		},

		'trims space off': function (topic) {
			var response = topic.add('   89  ');
			assert.equal('Hotfix queue is: [1234, 567, 89]', response.body);
		},
		
		'can deal with requests': function (topic) {
			var msg = {
				body: '1112',
				toString: function () {
					return this.body;
				}
			}
			var response = topic.add(msg);
			assert.equal('Hotfix queue is: [1234, 567, 89, 1112]', response.body);
		}
	},
	'removing from the queue': {
		topic: function () {
			return new QueueManager();
		},
		'shortens the list': function (topic) {
			topic.add('1234');
			var response = topic.remove();
			assert.equal('The Hotfix queue is empty, well done!', response.body);
		}
	},
	'shuffling the queue': {
		topic: function () {
			var queue = new QueueManager();
			queue.add('123');
			queue.add('456');
			queue.add('789');
			return queue;
		},
		'next promotes, delay pushes back': function (topic) {
			var ret = topic.next('456');
			assert.equal('Hotfix queue is: [456, 123, 789]', ret.body);

			ret = topic.delay('456');
			assert.equal('Hotfix queue is: [123, 456, 789]', ret.body);
		}
	}

}).export(module);
