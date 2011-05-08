var task = require('./task'),
	http = require('http'),
	util = require('util'),
	jsdom = require('jsdom');

var Weather = function () {
	
};

util.inherits(Weather, task.Task);
exports.Weather = Weather;

Weather.prototype.commands = {
	'!weather': 'query'
};

Weather.prototype.query = function (location) {
	var options = {
		host: 'www.google.com',
		path: '/ig/api?weather=' + location.trim(),
	}
	var _this = this;
	var promise = new task.Promise();
	http.get(options, function (response) {
		var contents = '';
		response.on('data', function(chunk) {
			contents += chunk;
		});
		response.on('end', function () {
			var body, reply = [];
			try {
				body = jsdom.jsdom(contents);
			} catch (e) {
				console.log(e.message);
				promise.resolve('Could not fetch weather data.');
				return;
			}
			var city = body.getElementsByTagName('city')[0];
			reply.push('Weather for ' + city.getAttribute('data'));
			var currentCondition = body.getElementsByTagName('current_conditions')[0];
			var conditions = currentCondition.getElementsByTagName('condition')[0];
			var temp = currentCondition.getElementsByTagName('temp_c')[0];
			var humidity = currentCondition.getElementsByTagName('humidity')[0];
			
			reply.push('Current conditions: ' + conditions.getAttribute('data') + 
					   ' ' + temp.getAttribute('data') + 'ºc');
			reply.push(humidity.getAttribute('data'));
			promise.resolve(reply.join("\n"));
		});
	});
	return promise;
};
