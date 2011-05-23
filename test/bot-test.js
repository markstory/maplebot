var Bot = require('../lib/bot').Bot,
	vows = require('vows'),
	assert = require('assert');

vows.describe('Bot').addBatch({
	'missing tasks configuration causes error': function () {
		assert.throws(function () {
			var bot = new Bot({});
		}, Error);
	},

	'missing task module causes error': function () {
		assert.throws(function () {
			var bot = new Bot({tasks: { 'Kaboom': '/path/to/nowhere'}});
		}, Error);
	},

	'missing task object causes error': function () {
		assert.throws(function () {
			var bot = new Bot({tasks: { 'Kaboom': '../lib/queue-manager'}});
		}, Error);
	},

	'configuration': {
		topic: function () {
			var config = {
				tasks: {'QueueManager': '../lib/queue-manager'}
			};
			return new Bot(config);
		},

		'binds commands': function (topic) {
			assert.ok(topic.commands['!qadd']);
			assert.ok(topic.commands['!qls']);
		},
		'stores a reference to task objects': function (topic) {
			assert.ok(topic.tasks[0], 'Missing task');
			assert.ok(topic.tasks[0].commands);
			assert.ok(topic.tasks[0].bindCommands);
		}
	},

	'message delegation': {
		topic: function () {
			var bot = new Bot({tasks: {}});
			bot.commands['!test'] = function (text) {
				return text;
			};
			return bot;
		},

		'finds task commands': function (topic) {
			var result = topic.handleMessage('!test hello world');
			assert.equal('hello world', result);
		},

		'returns empty on miss': function (topic) {
			var result = topic.handleMessage('!swing and a miss');
			assert.equal('', result);
		}
	}

}).export(module);
