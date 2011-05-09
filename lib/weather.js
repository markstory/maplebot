var task = require('./task'),
	http = require('http'),
	util = require('util'),
	jsdom = require('jsdom');

var Weather = function () {
	
};

util.inherits(Weather, task.Task);
exports.Weather = Weather;

Weather.prototype.commands = {
	'!weather': 'current',
	'!forecast': 'forecast'
};

Weather.prototype.current = function (location) {
	var promise = new task.Promise();
	query(location, function (contents) {
		var body, reply = [];
		try {
			body = getDom(contents);
		} catch (e) {
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
	return promise;
};


Weather.prototype.forecast = function (location) {
	var promise = new task.Promise();
	query(location, function (contents) {
		var body, reply = [];
		try {
			body = getDom(contents);
		} catch (e) {
			promise.resolve('Could not fetch weather data.');
			return;
		}
		var forecast = Array.prototype.slice.call(body.getElementsByTagName('forecast_conditions'));

		forecast.forEach(function (element) {
			var text;
			var day = element.getElementsByTagName('day_of_week')[0].getAttribute('data');
			var low = element.getElementsByTagName('low')[0].getAttribute('data');
			var high = element.getElementsByTagName('high')[0].getAttribute('data');
			var condition = element.getElementsByTagName('condition')[0].getAttribute('data');
			text = day + ' ' + condition + ' high of: ' + convertTemp(high) + ' low of: ' + convertTemp(low);
			reply.push(text);
		});
		promise.resolve(reply.join("\n"));
	});
	return promise;
};

function convertTemp(faren) {
	return ((5 / 9) * (faren - 32)).toFixed(0);
}

function getDom(contents) {
	body = jsdom.jsdom(contents.body);
	if (body.childNodes === 0) {
		throw Error('No xml response');
	}
	return body;
}

function query(location, callback) {
	var options = {
		host: 'www.google.com',
		path: '/ig/api?weather=' + encodeURIComponent(location.trim()),
	};
	http.get(options, function (response) {
		var contents = {body: ''};
		response.on('data', function(chunk) {
			contents.body += chunk;
		});
		response.on('end', callback.bind(this, contents));
	});

}
