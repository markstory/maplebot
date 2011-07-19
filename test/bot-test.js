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
			assert.ok(topic.commands.QueueManager['!qadd']);
			assert.ok(topic.commands.QueueManager['!qls']);
		},
		'stores a reference to task objects': function (topic) {
			assert.ok(topic.tasks['QueueManager'], 'Missing task');
			assert.ok(topic.tasks['QueueManager'].commands);
			assert.ok(topic.tasks['QueueManager'].bindCommands);
		}
	},
	'addTask passes settings along': {
		topic: function () {
			var config = {
				tasks: {
					'QueueManager': '../lib/queue-manager',
					'ConfigTest': {
						module: '../test/fixtures',
						key: 'value'
					}
				}
			};
			return new Bot(config);
		},

		'task has configuration': function (topic) {
			var task = topic.getTask('ConfigTest');
			assert.deepEqual({key: 'value'}, task.config);
		}
	},
	'message delegation': {
		topic: function () {
			var bot = new Bot({tasks: {}});
			bot.commands.Test = {};
			bot.commands.Test['!test'] = function (text) {
				return text;
			};
			return bot;
		},
		'finds task commands': function (topic) {
			var result = topic.handleMessage({ body: '!test hello world'});
			assert.ok(result.body);
			assert.equal('hello world', result.body);
		},
		'returns empty on miss': function (topic) {
			var result = topic.handleMessage({body: '!swing and a miss'});
			assert.equal('', result);
		}
	},
	'multi-room task handling': {
		topic: function () {
			var config = {
				tasks: {
					'QueueManager': '../lib/queue-manager',
					'Help': '../lib/help'
				},
				rooms: {
					'test1': ['QueueManager'],
					'test2': ['Help']
				}
			};
			var bot = new Bot(config);
			return bot;
		},
		'tasks not in a room will not respond to messages': function (topic) {
			var request = {
				room: 'test1',
				body: '!help'
			};
			var resp = topic.handleMessage(request);
			assert.equal(resp, '', 'Help task is not bound in room test1');

			request = {
				room: 'test2',
				body: '!qls'
			};
			resp = topic.handleMessage(request);
			assert.equal(resp, '');
		},
		'tasks in a room will respond to messages': function (topic) {
			var request = {
				room: 'test1',
				body: '!qls'
			};
			var resp = topic.handleMessage(request);
			assert.ok(/Hotfix/.test(resp.body), 'Should have replied');

			request = {
				room: 'test2',
				body: '!help'
			};
			resp = topic.handleMessage(request);
			assert.ok(/Available Commands/.test(resp), 'Help should have displayed');
		}
	}

}).export(module);
