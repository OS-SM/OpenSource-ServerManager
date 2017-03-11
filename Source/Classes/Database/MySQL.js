function MySQL() {
	var _mysql		= require('mysql');
	var _connection	= null;
	var _instance		= this;
	
	this.init = function init() {
		_connection		= _mysql.createPool({
			connectionLimit:	10,
			host:						Config.get('database.hostname'),
			port:						Config.get('database.port'),
			user:						Config.get('database.username'),
			password:				Config.get('database.password'),
			database:				Config.get('database.database'),
			queryFormat:			function queryFormat(query, values) {
				if(!values) {
					return query;
				}
				
				return query.replace(/\:(\w+)/g, function QueryReplacement(txt, key) {
					if(values.hasOwnProperty(key)) {
						return this.escape(values[key]);
					}
					
					return txt;
				}.bind(this));
			}
		});
	};
	
	this.query = function query(statement, parameters, callback) {
		_connection.getConnection(function(error, connection) {		
			connection.query(statement, parameters, function(error, results, fields) {
				connection.release();
				callback(error, results, fields);
			});
		});
	};
	
	this.select = function select(table, where, callback) {
		this.query('SELECT * FROM `' + table + '`', {
		}, callback);
	};
	
	this.insert = function insert(table, parameters, callback) {
		var names = [];
		var values	= [];
		
		Object.keys(parameters).forEach(function(name) {
			var value = parameters[name];
			names.push('`' + name + '`');
			
			if(value == null) {
				values.push('NULL');
				delete parameters[name];
			} else {
				values.push(':' + name);
			}
		});
		
		this.query('INSERT INTO `' + table + '` (' + names.join(', ') + ') VALUES(' + values.join(', ') + ')', parameters, function(error, result) {
			if(error) {
				console.log(error);
				callback(null);
				return;
			}
		
			callback(result.insertId);
		});
	};
	
	this.init();
}