// Basic XMPP bot example for HipChat using node.js
// To use:
//  1. Set config variables
//  2. Run `node bot.js`

var sys = require('sys'),
	util = require('util'),
	xmpp = require('node-xmpp');

var config = require('./config.json');

var QueueManager = require('./lib/queue-manager').QueueManager;

// Config 
var jid = "email addres";
var password = "password_here";
var room_jid = " chat room here ";
var room_nick = "bert";

var cl = new xmpp.Client({
  jid: config.username + '/bot',
  password: config.password
});

// Log all data received
//cl.on('data', function(d) {
//  util.log("[data in] " + d);
//});

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

  for (var c in commands) {
	if (commands.hasOwnProperty(c) && message.indexOf(c) === 0) {
		var response = '';
		var messageText = message.substring(c.length);
		response = commands[c](messageText, response);
		if (response && response.length) {
			var element = new xmpp.Element('message', {to: config.room, type: 'groupchat'})
				.c('body').t(response);
			cl.send(element);
		}
	}
  }

});

// Setup the commands.
var commands = {};

var queue = new QueueManager();
queue.bindCommands(commands);
