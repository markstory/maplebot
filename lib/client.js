var xmpp = require('node-xmpp'),
	util = require('util');

// Wrapper for XMPP client, provides bot task response handling.
var Client = function (config, bot) {
	this.config = config;
	this.bot = bot;
};

Client.prototype = {
	// connect to xmpp and start the bot.
	connect: function () {
		this.client  = new xmpp.Client({
			jid: this.config.username + '/bot',
			password: this.config.password
		});
		if (this.config.debug) {
			this.client.on('data', function(d) {
				util.log("[data in] " + d);
			});
			var oldSend = this.client.send;
			this.client.send = function (d) {
				if (typeof d !== 'string') {
					d = d.tree();
				}
				util.log('[data out] ' + d);
				oldSend.apply(this, arguments);
			}
		}
		this.client.on('online', this.online.bind(this));
		this.client.on('stanza', this.read.bind(this));
	},

	// Called after the client connects to the service
	online: function () {
		util.log("We're online!");
		var client = this.client;
		
		// set ourselves as online
		client.send(new xmpp.Element('presence', { type: 'available' }).
			c('show').t('chat')
		);

		var rooms = [];
		if (typeof this.config.room == 'string') {
			rooms.push(this.config.room);
		} else {
			rooms = this.config.room;
		}
		nick = this.config.nick;

		// join room (and request no chat history)
		rooms.forEach(function (room) {
			client.send(new xmpp.Element('presence', { to: room + '/' + nick })
				.c('x', { xmlns: 'http://jabber.org/protocol/muc' })
				.c('history', {seconds: 1})
			);
		});

		// send keepalive data or server will disconnect us after 150s of inactivity
		setInterval(function() {
			client.send(' ');
		}, 30000);

		this.onlineTime = new Date();
	},

	// Read messages coming from xmpp.
	read: function (stanza) {
		// always log error stanzas
		if (stanza.attrs.type == 'error') {
			util.log('[error] ' + stanza);
			return;
		}

		// ignore everything that isn't a room message or a message to the bot.
		if (!stanza.is('message') || ['groupchat', 'direct', 'chat'].indexOf(stanza.attrs.type) == -1) {
			return;
		}

		// ignore messages we sent
		if (stanza.attrs.from == this.config.room + '/' + this.config.nick) {
			return;
		}
		var request = this.makeRequest(stanza);

		// an incoming message without body is probably a topic change
		if (!request) {
			return;
		}

		var response = this.bot.handleMessage(request);
		if (response) {
			this.send(response, request);
		}
	},

	// Convert a stanza into a 'request' object that contains relavant information.
	makeRequest: function (stanza) {
		var sender = stanza.attrs.from.split('/');
		var bodyEl = stanza.getChild('body');
		if (!bodyEl) {
			return false;
		}
		var req = {
			type: stanza.attrs.type,
			room: sender[0],
			from: sender[1],
			body: bodyEl.getText(),
			bodyEl: bodyEl,
			toString: function () {
				return this.body;
			}
		};
		return req;
	},

	send: function (response, request) {
		var _this = this;
		// Simple string responses
		if (typeof response == 'string') {
			response = this.mergeResponse({body: response}, request);
			var element = this._makeMessage(response);
			return this.client.send(element);
		}
		// Handle promises.
		if (response.when && typeof response.when == 'function') {
			response.when(function (reply) {
				reply = _this.mergeResponse(reply, request);
				_this.send(reply);
			});
		} else if (typeof response == 'object' && response !== null) {
			['subject', 'body'].forEach(function (type) {
				if (response[type]) {
					response = _this.mergeResponse(response, request);
					_this.client.send(_this._makeMessage(response, type));
				}
			});
		}
	},

	mergeResponse: function (resp, req) {
		['room', 'type', 'from'].forEach(function (key) {
			if (resp[key] === undefined && req && req[key] !== undefined) {
				resp[key] = req[key];
			}
		});
		return resp;
	},

	_makeMessage: function (response, elType) {
		elType = elType || 'body';
		var element = new xmpp.Element('message', {to: response.room, type: response.type})
			.c(elType).t(response[elType]);
		return element;
	}
};

exports.Client = Client;
