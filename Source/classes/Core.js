(function Core() {
	this.init = function init() {
		var gui	= require('nw.gui');
		var win	= gui.Window.get();
		win.showDevTools(this);
		
		document.addEventListener('click', function onClick(event) {
			if(!event) {
				event = window.event;
			}
			
			var parent = Tools.getClosest(event.target, '[data-action]');
			
			if(typeof(parent) != 'undefined' && typeof(parent.dataset) != 'undefined' && typeof(parent.dataset.action) != 'undefined') {
				switch(parent.dataset.action) {
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
					case 'settings:save':
					case 'settings:close':
					case 'settings:toggle':
						var element	= document.querySelector('overlay[data-view="settings"]');
						element.classList.toggle('show');
						this.checkOverlay();
					break;
				}
			}
		}.bind(this));
		
		this.checkOverlay();
		
		var c = new Client('localhost', 11000, 'test123', {
			
		});
			
		c.connect();
		
	/*	gui.Window.open('create.html', {
			frame: false
		});*/
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
	
	this.init();
}());