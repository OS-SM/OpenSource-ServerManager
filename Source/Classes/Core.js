(function Core() {
	var Core, Servers;
	var _file_system		= require('fs');
	var _path				= require('path');
	var _gui					= require('nw.gui');
	
	this.init = function init() {
		var win				= _gui.Window.get();
		
		if(typeof(_gui.App.setCrashDumpDir) != 'undefined') {
			_gui.App.setCrashDumpDir(process.cwd() + _path.sep + 'Logs' + _path.sep);
		}
		
		if(typeof(Tools) != 'undefined') {
			global.Tools = Tools;
		} else if(typeof(global.Tools) != 'undefined') {
			Tools = global.Tools;
		}
		
		if(typeof(global.Servers) == 'undefined') {
			global.Servers = {};
		}
		
		if(typeof(global.Core) == 'undefined') {
			global.Core = this;
		}
		
		if(typeof(global.Core) != 'undefined') {
			Core = global.Core;
		}
		
		if(typeof(global.Servers) != 'undefined') {
			Servers = global.Servers;
		}
				
		if(!this.isInstalled()) {
			setTimeout(function() {
				alert('OpenSource-ServerManager is currently not configured.');
				_gui.App.quit();
			}, 1000);
			return;
		} else if(typeof(Config) != 'undefined') {
			switch(Config.get('database.type')) {
				case 'mysql':
					Database = new MySQL();
				break;
				default:
					setTimeout(function() {
						alert('Database type "' + Config.get('database.type') + '" currently not available.');
						_gui.App.quit();
					}, 1000);
					return;
				break;
			}
		}
		
		if(typeof(Database) != 'undefined') {
			global.Database = Database;
		} else if(typeof(global.Database) != 'undefined') {
			Database = global.Database;
		}
		
		this.updateServer();
		
		document.addEventListener('click', function onClick(event) {
			if(!event) {
				event = window.event;
			}
			
			var checkbox	= Tools.getClosest(event.target, 'input[type="checkbox"]');
			
			if(typeof(checkbox) != 'undefined') {
				var title = 'Disabled';
				
				if(checkbox.checked) {
					 title = 'Enabled';
				}
				
				document.querySelector('span[data-checkbox="' + checkbox.name + '"]').innerHTML = title;
			}
			
			var parent		= Tools.getClosest(event.target, '[data-action]');
			
			if(typeof(parent) != 'undefined' && typeof(parent.dataset) != 'undefined' && typeof(parent.dataset.action) != 'undefined') {
				switch(parent.dataset.action) {
					case 'selection':
						var name							= parent.dataset.name;
						var selection						= Tools.getClosest(parent, 'selection');
						selection.dataset.selected	= name;
						
						[].forEach.call(selection.querySelectorAll('li'), function(element) {
							if(element.classList.contains('selected')) {
								element.classList.remove('selected');
							}
						});
						
						parent.classList.add('selected');
					break;
					
					/* Window */
					case 'window:close':
						win.close(true);
					break
					case 'window:maximize':
						document.querySelector('button[data-action="window:maximize"]').dataset.action = 'window:restore';
						win.maximize();
					break;
					case 'window:restore':
						win.restore();
						document.querySelector('button[data-action="window:restore"]').dataset.action = 'window:maximize';
					break;
					case 'window:minimize':
						win.minimize();
					break;
					
					/* Settings */
					case 'settings:save':
					case 'settings:close':
					case 'settings:toggle':
						var element	= document.querySelector('overlay[data-view="settings"]');
						element.classList.toggle('show');
						this.checkOverlay();
					break;
					
					/* Server */
					case 'server:create':
						_gui.Window.open('Views/Server/Create.html', {
							focus:		true,
							position:	'center',
							width:		300,
							height:		415,
							frame:		false,
							resizable:	false
						});
					break;
					case 'server:save':
						Database.insert('servers', {
							id:					null,
							ip_address:		document.querySelector('input[name="ip_address"]').value,
							ip_port:				document.querySelector('input[name="ip_port"]').value,
							game:				document.querySelector('selection').dataset.selected,
							password:			document.querySelector('input[name="password"]').value,
							autoconnect:		document.querySelector('input[name="autoconnect"]').checked ? 'Y' : 'N'
						}, function(id) {
							Core.updateServer();
						});
						
						win.close(true);
					break;
					case 'server:close':
						win.close(true);
					break;
				}
			}
		}.bind(this));
		
		this.checkOverlay();
		
		if(document.body.dataset.name == 'Server:Create') {
			Core.getGames();
			
			var selection	= document.querySelector('content selection');
			var list 			= document.querySelector('content selection ul');
			var games		= Object.keys(global.Games);
			var size			= 80;
			
			games.forEach(function(name) {
				var game		= global.Games[name];
				var selected	= false;
				
				if(selection.dataset.selected == 'none') {
					selection.dataset.selected	= name;
					selected							= true;
				}
				
				list.innerHTML += '<li data-action="selection" data-name="' + name + '" style="background-image: url(\'file:///' + game.path.replace(/\\/g, '/') + 'logo.png\');" title="' + game.title + '" class="' + (selected ? 'selected' : '') + '"></li>';
			});
			
			list.style.width = (games.length * size) + 'px';
			
			selection.addEventListener('mousewheel', function onScroll(event) {
				event						= window.event || event;
				var delta					= Math.max(-1, Math.min(1, (event.wheelDelta || -event.detail)));
				selection.scrollLeft		-= (delta * size);
				event.preventDefault();
			}, false);
		}
	};
	
	this.isInstalled = function isInstalled() {
		return _file_system.existsSync(_path.dirname(process.execPath) + _path.sep + 'Config.json');
	};
	
	this.checkOverlay = function checkOverlay() {
		var elements	= document.querySelectorAll('overlay');
		document.body.dataset.overlay = null;
		
		[].forEach.call(elements, function(element) {
			if(element.classList.contains('show')) {
				document.body.dataset.overlay = 'settings';
			}
		});
	};
	
	this.getGame = function getGame(name) {
		Core.getGames();
		
		return global.Games[name];
	};
	
	this.getGames = function getGames() {
		global.Games	= {};
		var files				= _file_system.readdirSync(process.cwd() + _path.sep + 'Classes' + _path.sep + 'Games' + _path.sep);
		
		files.forEach(function(name) {
			var config			= require(process.cwd() + _path.sep + 'Classes' + _path.sep + 'Games' + _path.sep + name + _path.sep + 'config.json');
			config.path		= process.cwd() + _path.sep + 'Classes' + _path.sep + 'Games' + _path.sep + name + _path.sep;
			global.Games[name]	= config;
		});
	};
	
	this.updateServer = function updateServer() {
		if(document.body.dataset.name != 'Main') {
			return;
		}
		
		var servers				= document.querySelector('content servers');
		servers.innerHTML	= '';
		
		Database.select('servers', undefined, function(error, results, fields) {
			console.log(error, results, fields);
			
			var header = '<header>';
			header += '<entry>Game</entry>';
			header += '<entry>Server</entry>';
			header += '<entry>Players</entry>';
			header += '<entry>Type</entry>';
			header += '<entry>Ping</entry>';
			header += '</header>';
			
			servers.innerHTML = header;
			
			results.forEach(function(server) {
				var game 					= Core.getGame(server.game);
				var server_instance	= Servers[server.id];
				
				if(typeof(server_instance) == 'undefined') {
					setTimeout(function() {
						server_instance		= new Server(server, game);
						Servers[server.id]	= server_instance;
					}, 500);
				}
				
				var html = '<server data-id="' + server.id + '" data-game="' + server.game + '">';
				html += '<icon><picture style="background-image: url(\'file:///' + game.path.replace(/\\/g, '/') + 'icon.png\');"></picture></icon>';
				html += '<name>';
				html += '<strong>' + server.ip_address + ':' + server.ip_port+ '</strong>';
				html += '<description></description>';
				html += '</name>';
				html += '<players>0 / 0</players>';
				html += '<type></type>';
				html += '<ping></ping>';
				html += '</server>';
				
				servers.innerHTML +=  html;
			});
		});
	};
	
	this.init();
}());