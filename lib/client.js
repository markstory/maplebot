var xmpp = require('node-xmpp'),
	util = require('util');

// Wrapper for XMPP client, provides bot task response handling.
var Client = function (config, bot) {
	this.config = config;
	this.bot = bot;
}
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

		// ignore everything that isn't a room message
		if (!stanza.is('message') || stanza.attrs.type != 'groupchat') {
			return;
		}

		// ignore messages we sent
		if (stanza.attrs.from == this.config.room + '/' + this.config.nick) {
			return;
		}
		var from = stanza.attrs.from;
		var room = from.substring(0, from.indexOf('/'));
		var body = stanza.getChild('body');

		// message without body is probably a topic change
		if (!body) {
			return;
		}

		var response = this.bot.handleMessage(body.getText());
		if (response) {
			this.send(response, room);
		}
	},

	send: function (response, room) {
		var _this = this;
		// Simple string responses
		if (typeof response == 'string') {
			var element = this._makeMessage(response, room);
			return this.client.send(element);
		}
		// Handle promises.
		if (response.when && typeof response.when == 'function') {
			response.when(function (reply) {
				var element = _this._makeMessage(reply, room);
				_this.client.send(element);	
			});
		}
	},

	_makeMessage: function (text, room) {
		var element = new xmpp.Element('message', {to: room, type: 'groupchat'})
			.c('body').t(text);
		return element;
	}
};

exports.Client = Client;
