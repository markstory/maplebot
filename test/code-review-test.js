var CodeReview = require('../lib/code-review').CodeReview,
	vows = require('vows'),
	assert = require('assert');

vows.describe('CodeReview Task').addBatch({
	'adding to the list': {
		topic: function () {
			return new CodeReview();
		},

		'adds to the list': function(topic) {
			var response = topic.add({from:'tom'});
			assert.equal(response, 'Thanks, you will be part of code review today.');

			response = topic.add({from:'jerry'});
			assert.equal(response, 'Thanks, you will be part of code review today.');

			response = topic.show();
			assert.equal(response, 'Awaiting code review: [tom, jerry]');
		},
	},
	'removing from the list': {
		topic: function () {
			return new CodeReview();
		},
		'removes from the list': function (topic) {
			topic.add({from:'petunia'});
			var response = topic.remove({from:'petunia'});
			assert.equal(response, "You've been removed from today's code review.");
		}
	},
	'pairs properly': {
		topic: function () {
			return new CodeReview();
		},
		'refuses to pair single': function (topic) {
			topic.add({from:'pig'});
			var response = topic.pair();
			assert.equal(response, "Need at least two people for code review!");
		},
		'pairs two' : function (topic) {
			topic.add({from:'horse'});
			var response = topic.pair();
			assert.include(response, 'Code Review Pairs');
			assert.include(response, 'horse');
			assert.include(response, 'pig');
		},
		'empties list after pairing' : function(topic){
			var response = topic.show();
			assert.equal(response, 'Nobody needs code review. Get to work!');
		},
		'pairs three' : function (topic) {
			topic.add({from:'horse'});
			topic.add({from:'pig'});
			topic.add({from:'chicken'});
			var response = topic.pair();
			assert.include(response, 'Code Review Pairs');
			assert.include(response, 'horse');
			assert.include(response, 'pig');
			assert.include(response, 'chicken');
		},
	}

}).export(module);
