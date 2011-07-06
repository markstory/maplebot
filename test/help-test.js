var vows = require('vows'),
	bot = require('../lib/bot'),
	assert = require('assert'),
	help = require('../lib/help');

vows.describe('Help task').addBatch({
	'collects help from other tasks': {
		topic: function () {
			var dummy = {
				tasks: {
					'function': {
						help: function () {
							return 'I am a function help';
						}
					},
					'empty': {
						help: function () { }
					},
					'string': {
						help: 'I am string help'
					},
					'undefined': {
						help: undefined
					}
				},
				getRoomTasks: function () {
					return Object.keys(this.tasks);
				},
				getTask: function (name) {
					return this.tasks[name];
				}
			};
			var topic = new help.Help(dummy);
			return topic.show({});
		},
		'ignores undefined': function (topic) {
			assert.ok(/undefined/.test(topic) === false);
		},
		'uses .help if its a string': function (topic) {
			assert.ok(/I am string/.test(topic));	
		},
		'calls help() functions': function (topic) {
			assert.ok(/I am a function/.test(topic));
		}
	},
	'only shows help for tasks in the same room': {
		topic: function () {
			var config = {
				tasks: {
					'Weather': '../lib/weather', 
					'QueueManager': '../lib/queue-manager'
				},
				rooms: {
					'room-one': ['Weather'],
					'room-two': ['QueueManager']
				}
			}
			var Bot = new bot.Bot(config);
			return new help.Help(Bot);
		},
		'only gets help for some tasks': function (topic) {
			var result = topic.show({room: 'room-one'});
			assert.ok(/QueueManager/.test(result) === false);
		}
	}
}).export(module);
