(function Core() {
	var _file_system		= require('fs');
	var _path				= require('path');
	var _gui					= require('nw.gui');
	var _games			= {};
	
	this.init = function init() {
		var win	= _gui.Window.get();
		
		document.addEventListener('click', function onClick(event) {
			if(!event) {
				event = window.event;
			}
			
			var parent = Tools.getClosest(event.target, '[data-action]');
			
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
							height:		375,
							frame:		false,
							resizable:	false
						});
					break;
				}
			}
		}.bind(this));
		
		_games = this.getGames();
		
		this.checkOverlay();
		
		if(document.body.dataset.name == 'Server:Create') {
			var selection	= document.querySelector('content selection');
			var list 			= document.querySelector('content selection ul');
			var games		= Object.keys(_games);
			var size			= 80;
			
			games.forEach(function(name) {
				var game		= _games[name];
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
	
	this.checkOverlay = function checkOverlay() {
		var elements	= document.querySelectorAll('overlay');
		document.body.dataset.overlay = null;
		
		[].forEach.call(elements, function(element) {
			if(element.classList.contains('show')) {
				document.body.dataset.overlay = 'settings';
			}
		});
	};
	
	this.getGames = function getGames() {
		var games	= {};
		var files		= _file_system.readdirSync(process.cwd() + _path.sep + 'Classes' + _path.sep + 'Games' + _path.sep);
		
		files.forEach(function(name) {
			var config			= require(process.cwd() + _path.sep + 'Classes' + _path.sep + 'Games' + _path.sep + name + _path.sep + 'config.json');
			config.path		= process.cwd() + _path.sep + 'Classes' + _path.sep + 'Games' + _path.sep + name + _path.sep;
			games[name]	= config;
		});
		
		return games;
	};
	
	this.init();
}());