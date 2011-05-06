// Basic XMPP bot example for HipChat using node.js
// To use:
//  1. Set config variables
//  2. Run `node bot.js`

var sys = require('sys'),
	util = require('util'),
	xmpp = require('node-xmpp');

try {
	var config = require('./config.json');
} catch (e) {
	console.error('ERROR - No configuration file found. Make a config.json');
	process.exit(1);
}

var QueueManager = require('./lib/queue-manager').QueueManager;

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
	cl.commands = getCommands(config);
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
	var message = body.getText();

	for (var c in cl.commands) {
		if (cl.commands.hasOwnProperty(c) && message.indexOf(c) === 0) {
			var response = '';
			var messageText = message.substring(c.length);
			response = cl.commands[c](messageText, response);
			if (response && response.length) {
				var element = new xmpp.Element('message', {to: config.room, type: 'groupchat'})
					.c('body').t(response);
				cl.send(element);
			}
		}
	}

});

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

// Get the configured task objects and their commands.
// Calls .bindCommands on each task.
function getCommands(config) {
	if (!config.tasks) {
		console.error('ERROR - No configured tasks');
		process.exit(1);
	}
	var commandList = {};
	Object.keys(config.tasks).forEach(function (task) {
		var mod, taskObject;
		try {
			mod = require(config.tasks[task]);
		} catch (e) {
			console.error('ERROR - Could not load module ' + config.tasks[task]);
			process.exit(1);
		}
		if (!mod[task]) {
			console.error('ERROR - Could not find task ' + task + ' in module ' + config.tasks[task]);
			process.exit(1);
		}
		taskObject = new mod[task]();
		taskObject.bindCommands(commandList);
	});
	return commandList;
}

