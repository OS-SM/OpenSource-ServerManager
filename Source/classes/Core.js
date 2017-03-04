(function Core() {
	this.init = function init() {
		var gui	= require('nw.gui');
		var win	= gui.Window.get();
		win.showDevTools(this);
		
		document.addEventListener('click', function onClick(event) {
			if(typeof(event.target.dataset) != 'undefined' && typeof(event.target.dataset.action) != 'undefined') {
				switch(event.target.dataset.action) {
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
				}
			}
		});
		
		var c = new Client('localhost', 11000, 'test123', {
			
		});
			
		c.connect();
		
	/*	gui.Window.open('create.html', {
			frame: false
		});*/
	};
	
	this.init();
}());