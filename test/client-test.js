var client = require('../lib/client'),
	bot = require('../lib/bot'),
	task = require('../lib/task'),
	ltx = require('ltx'),
	sinon = require('sinon'),
	vows = require('vows'),
	assert = require('assert');

var fixtures = {
	groupChat: "<message from='test@conference.jabber.company.com/Mark Story' to='mark@jabber.company.com/bot' type='groupchat' id='purple4ef0fdee'><body>hey</body></message>",

	nonGroupChat: "<message from='test@conference.jabber.company.com/Mark Story' to='mark@jabber.company.com/bot' type='direct' id='purple4ef0fdee'><body>hey</body></message>",

	selfMessage: "<message from='test/bot' to='test/bot' type='groupchat' id='purple4ef0fdee'><body>hey</body></message>"
};

vows.describe('Client').addBatch({
	'online': {
		topic: function () {
			var topic = new client.Client({room: 'test', nick:'bot'}, {});
			topic.client = {
				messages: [],
				send: function (message) {
					this.messages.push(message);
				}
			};
			return topic;
		},
		'joins room with no history': function (topic) {
			topic.online();

			assert.equal(2, topic.client.messages.length);
			var message = topic.client.messages.pop();

			assert.equal('history', message.name);
			assert.equal(1, message.attrs.seconds);
			assert.equal('x', message.parent.name);

			message = topic.client.messages.pop();
			assert.equal('show', message.name);
			assert.equal('presence', message.parent.name);
		},
		'joins multiple rooms': function () {
			var topic = new client.Client({room:['test', 'test2'], nick: 'bot'});
			topic.client = {
				messages: [],
				send: function (message) {
					this.messages.push(message);
				}
			};
			topic.online();
			assert.equal(topic.client.messages.length, 3);

			var msg = topic.client.messages.pop();
			assert.equal('history', msg.name);
			assert.equal('test2/bot', msg.parent.parent.attrs.to);

			msg = topic.client.messages.pop();
			assert.equal('history', msg.name);
			assert.equal('test/bot', msg.parent.parent.attrs.to);
		}
	},

	'read': {
		topic: function () {
			var botMock = {
				handleMessage: sinon.stub()
			};
			var clientStub = {
				send: sinon.stub()
			};

			var topic = new client.Client({room: 'test', nick:'bot'}, botMock);
			topic.client = clientStub;
			return topic;
		},

		'ignores messages not from groupchat': function (topic) {
			var stanza = ltx.parse(fixtures.nonGroupChat);
			topic.read(stanza);
			assert.equal(false, topic.bot.handleMessage.called);
		},

		'ignore messages from self': function (topic) {
			var stanza = ltx.parse(fixtures.selfMessage);
			topic.read(stanza);
			assert.equal(false, topic.bot.handleMessage.called);
		},

		'recieve messages': function (topic) {
			var stanza = ltx.parse(fixtures.groupChat);
			topic.bot.handleMessage.returns('Winning');
			topic.read(stanza);
			assert.ok(topic.bot.handleMessage.called);
			assert.ok(topic.client.send.called);
		}
	},

	'send': {
		topic: function () {
			var clientStub = {
				send: sinon.spy()
			};

			var topic = new client.Client({room: 'test', nick:'bot'}, {});
			topic.client = clientStub;
			return topic;
		},

		'delivers text messages': function (topic) {
			topic.client.send = sinon.spy();
			topic.send('hello world', {room:'test'});
			assert.ok(topic.client.send.called);
		},

		'delivers promises': function (topic) {
			topic.client.send = sinon.spy();
			var p = new task.Promise();
			topic.send(p, {room: 'test'});
			p.resolve('told you so');

			assert.ok(topic.client.send.called, 'Send was never called.');
		},
		'sends subject messages too': function (topic) {
			topic.client.send = sinon.spy();
			topic.send({room: 'test', body: 'This is text', subject: 'This is a topic!'});

			assert.ok(topic.client.send.called);
			assert.equal(2, topic.client.send.callCount);
			
			var call = topic.client.send.getCall(0);
			assert.equal('subject', call.args[0].name);

			call = topic.client.send.getCall(1);
			assert.equal('body', call.args[0].name);
		}
	},
	'sends messages to the right rooms': {
		topic: function () {
			var clientStub = {
				send: sinon.spy()
			};

			var topic = new client.Client({room: 'test', nick:'bot'}, {});
			topic.client = clientStub;
			return topic;
		},
		'works': function (topic) {
			var resp = {
				body: 'message',
				type: 'groupchat',
				room: 'room/bot'
			};
			topic.send(resp, {});

			assert.ok(topic.client.send.called);
			var call = topic.client.send.getCall(0);
			assert.equal('room/bot', call.args[0].parent.attrs.to);
		}
	},
	'makeRequest': {
		topic: function () {
			var  cli = new client.Client({room: 'test', nick:'bot'}, {});

			var stanza = ltx.parse(fixtures.groupChat);
			return cli.makeRequest(stanza);
		},
		'includes sender': function (topic) {
			assert.equal(topic.from, 'Mark Story');
		},
		'includes room': function (topic) {
			assert.equal(topic.room, 'test@conference.jabber.company.com');
		},
		'includes body': function (topic) {
			assert.equal(topic.body, 'hey');
		},
		'includes body element': function (topic) {
			assert.ok(typeof topic.bodyEl.getText === 'function');
		},
		'string cast gets body': function (topic) {
			assert.equal('' + topic, 'hey');
		},
		'includes a type': function (topic) {
			assert.equal('groupchat', topic.type);
		}
	}
}).export(module);
