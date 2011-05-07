// Basic XMPP bot example for HipChat using node.js
// To use:
//  1. Set config variables
//  2. Run `node bot.js`

var sys = require('sys'),
	util = require('util'),
	xmpp = require('node-xmpp'),
	bot = require('./lib/bot');

try {
	var config = require('./config.json');
} catch (e) {
	console.error('ERROR - No configuration file found. Make a config.json');
	process.exit(1);
}

var cl = new xmpp.Client({
    jid: config.username + '/bot',
    password: config.password
});

// Log all the data coming in
if (config.debugIncoming) {
	cl.on('data', function(d) {
		util.log("[data in] " + d);
	});
}

// Once connected, set available presence and join room
cl.on('online', function() {
	util.log("We're online!");
	// set ourselves as online
	cl.send(new xmpp.Element('presence', { type: 'available' }).
		c('show').t('chat')
	);

	// join room (and request no chat history)
	cl.send(new xmpp.Element('presence', { to: config.room + '/' + config.nick }).
		c('x', { xmlns: 'http://jabber.org/protocol/muc' })
	);

	// send keepalive data or server will disconnect us after 150s of inactivity
	setInterval(function() {
		cl.send(' ');
	}, 30000);

	cl.onlineTime = new Date();
});

cl.on('stanza', function(stanza) {
	// always log error stanzas
	if (stanza.attrs.type == 'error') {
		util.log('[error] ' + stanza);
		return;
    }

	// ignore everything that isn't a room message
	if (!stanza.is('message') || !stanza.attrs.type == 'groupchat') {
		return;
	}

	// ignore older messages.
	var delay = stanza.getChild('x');
	if (delay && delay.attrs.stamp) {
		var messageTime = parseMessageDelay(delay.attrs.stamp);
		if (cl.onlineTime < messageTime) {
			return;
		}
	}

	// ignore messages we sent
	if (stanza.attrs.from == config.room + '/' + config.nick) {
		return;
	}

	var body = stanza.getChild('body');

	// message without body is probably a topic change
	if (!body) {
		return;
	}

	var response = chatBot.handleMessage(body.getText());
	if (response) {
		var element = new xmpp.Element('message', {to: config.room, type: 'groupchat'})
			.c('body').t(response);
		cl.send(element);
	}
});

var chatBot = new bot.Bot(config);

// Parse xmpp timestamps into a javascript date object.
// CCYYMMDDThh:mm:ss
function parseMessageDelay(time) {
	var year = time.substring(0, 4),
		month = time.substring(4, 6),
		day = time.substring(6, 8),
		hour = time.substring(9, 11),
		minute = time.substring(12, 14),
		second = time.substring(15, 17);
	return new Date(year, month, day, hour, minute, second);
}

