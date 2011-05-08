var task = require('../lib/task'),
	vows = require('vows'),
	assert = require('assert');

vows.describe('Promise').addBatch({
	'resolve': {
		topic: function () {
			return new task.Promise();
		},
		'triggers callback when attached ahead of time': function (topic) {
			topic.when(
				function (arg) {
					assert.equal('value', arg, 'resolve was called.');
				},
				function () {
					assert.fail('no good');
				}
			);
			topic.resolve('value');
		},
		'triggers callback after the fact': function (topic) {
			topic.when(function (arg) {
				assert.equal('value', arg);
			});
			topic.resolve('booger');
		}
	},
	'reject': {
		topic: function () {
			return new task.Promise();
		},
		'triggers callback when attached ahead of time': function (topic) {
			topic.when(
				function (arg) {
					assert.fail('no good');
				},
				function () {
					assert.equal('value', arg, 'reject was called.');
				}
			);
			topic.reject('value');
		},
		'triggers callback after the fact': function (topic) {
			topic.when(
				function () {
					assert.fail(true);
				},
				function (arg) {
					assert.equal('value', arg);
				});
			topic.reject('something');
		}
	}
}).export(module);
