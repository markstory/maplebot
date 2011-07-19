var task = require('./task'),
	util = require('util');

// A simple task that allows you to pair up coders for code review
var CodeReview = function (bot) {
	this.pending = [];
};
exports.CodeReview = CodeReview;
util.inherits(CodeReview, task.Task);

CodeReview.prototype.commands = {
	'!haz': 'add',
	'!nohaz': 'remove',
	'!who': 'show',
	'!pairup': 'pair',
};

CodeReview.prototype.add = function (request) {
	var coder = request.from;
	if (this.pending.indexOf(coder) == -1) {
		this.pending.push(coder);
		return 'Thanks, you will be part of code review today.';
	} else {
		return 'Already in the list!';
	}
}

CodeReview.prototype.remove = function (request) {
	var coder = request.from;
	if (this.pending.indexOf(coder) > -1){
		this.pending.splice(this.pending.indexOf(coder), 1);
		return "You've been removed from today's code review.";
	}
	return request.from + " wasn't in the list, silly.";
};

CodeReview.prototype.show = function () {
	var pending = this.pending;

	if (pending.length === 0) {
		return 'Nobody needs code review. Get to work!';
	}
	return 'Awaiting code review: [' + pending.join(', ') + ']';
};

CodeReview.prototype.pair = function () {
	var who = this.pending;
	if (who.length < 2){
		return "Need at least two people for code review!";
	}
	//reset the array
	this.pending = [];
	//scramble the list
	who.sort(function() {return 0.5 - Math.random()});
	var text = [
	'Code Review Pairs',
	'-----------------',
	];
	var pair = '';
	//deal with odd numbers
	if (who.length % 2 === 1){
		var loner = who.pop();
		pair += loner + ', ';
	}
	for(var i = 0; i < who.length; i+=2) {
		pair += who[i] + ' and ' + who[i+1] + "\n";
		text.push(pair);
		pair='';
	}
	return text.join('\n');
}

CodeReview.prototype.help = function() {
	return [
		'CodeReview',
		'------------',
		'!haz: Add yourself as having code to review.',
		'!nohaz: Change your mind, remove yourself',
		'!who: Display list of who has code to review',
		'!pairup: Pair (or triple) up devs for review.',
	].join('\n');
};
