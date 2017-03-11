var Config = (new function Config() {
	var _path	= require('path');
	var _file		= _path.dirname(process.execPath) + _path.sep + 'Config.json';
	var _config = require(_file);
	
	this.get = function get(name) {
		var split		= name.split('.');
		var node	= _config;
		
		for(var entry in split) {
			node = node[split[entry]];
		};
		
		return node;
	};
}());