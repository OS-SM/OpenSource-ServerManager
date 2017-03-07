var Client = function Client(host, port, password, options) {
	var net = require('net');

	var host = '',
	port = 0,
	password = '';
	
	var socket;
	
	this.init = function init(host, port, password, options) {
		this.host = host;
		this.port = port;
		this.password = password;
	};
	
	this.connect = function connect() {
		console.log('Connecting..');
		socket = net.createConnection({port: 11000, host: 'localhost' });
		socket.on('data', function(data) {
			console.log('data', data);
		});
		socket.on('connect', function() { console.log('connect'); });
		socket.on('error', function(err) { console.log('error', err); });
		socket.on('end', function() { console.log('end'); });
	};
	
	this.init(host, port, password, options);
};