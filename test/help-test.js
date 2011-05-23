var vows = require('vows'),
	bot = require('../lib/bot'),
	assert = require('assert'),
	help = require('../lib/help');

vows.describe('Help task').addBatch({
	'collects help from other tasks': {
		topic: function () {
			var dummy = {
				tasks: [
					{
						help: function () {
							return 'I am a function help';
						}
					},
					{
						help: 'I am string help'
					},
					{
						help: undefined
					}
				]
			};
			var topic = new help.Help(dummy);
			return topic.show();
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
	}
}).export(module);
