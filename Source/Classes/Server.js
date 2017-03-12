var Server = function Server(server, game) {
	var _engine = null;
	
	this.init = function init(server, game) {
		switch(game.engine) {
			case 'frostbite3':
				_engine = new frostbite3(server.ip_address, server.ip_port, server.password);
			break;
		}
		
		if(server.autoconnect == 'Y') {
			_engine.connect();
		}
	};
	
	this.init(server, game);
};