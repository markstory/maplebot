// Basic XMPP bot example for HipChat using node.js
// To use:
//  1. Set config variables
//  2. Run `node bot.js`

var sys = require('sys'),
	util = require('util'),
	client = require('./lib/client'),
	xmpp = require('node-xmpp'),
	bot = require('./lib/bot');

try {
	var config = require('./config.json');
} catch (e) {
	console.error('ERROR - No configuration file found. Make a config.json');
	process.exit(1);
}
try {
	var chatBot = new bot.Bot(config);
} catch (e) {
	console.error('ERROR - ' + e);
	process.exit(1);
}
var client = new client.Client(config, chatBot);

client.connect();

