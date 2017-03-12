var frostbite3 = function frostbite3(host, port, password) {
	var Decoder = (function Decoder() {
		this.getHeader = function getHeader(buffer) {
			var header = buffer.readUInt32LE(0);

			return {
				isFromServer:	!!(header & 0x80000000),
				isResponse:		!!(header & 0x40000000),
				sequence:			(header & 0x3fffffff)
			};	
		};
		
		this.getPacket = function getPacket() {
			var header	= this.getHeader(buffer);
			var words		= this.getWords(buffer, size);
			var packet		= new Packet();
			
			packet.setSequence(header.sequence);
			packet.setServer(header.isFromServer);
			packet.setResponse(header.isResponse);
			packet.setWords(words);
			
			return packet;
		};
		
		this.getPacketSize = function getPacketSize(buffer) {
			return buffer.readUInt32LE(4);
		};
	}());
	
	var Encoder = (function Encoder() {
		this.getSequence = function getSequence(buffer, offset, packet) {
			 var h = packet.getSequence() & 0x3fffffff;

			if(packet.isFromServer()) {
				h += 0x80000000
			}

			if(packet.isResponse()) {
				h += 0x40000000
			}

			buffer.writeUInt32LE(h, offset);

			return offset + 4;
		};
		
		this.getInfo = function getInfo(buffer, offset, packet) {
			buffer.writeUInt32LE(packet.getSize(), offset);
			offset += 4;
			buffer.writeUInt32LE(packet.getNumWords(), offset);

			return offset + 4;
		};
		
		this.getWords = function getWords(buffer, offset, packet) {
			 packet.getWords().forEach(function(word) {
				buffer.writeUInt32LE(word.length, offset);
				offset += 4;
				buffer.write(word, offset, false, 'ascii');
				offset += word.length;
				buffer.write('\0', offset, false, 'binary');
				offset ++;
			});

			return offset;
		};
	}());
	
	function Packet() {
		this.HEADER_SIZE = 12;
		this.MAX_SIZE = 16384;
		
		var _id = -1;
		var _is_from_server = false;
		var _is_response = false;
		var _words = [];
		
		this.getSequence = function getSequence() {
			return _id;
		};
		
		this.setSequence = function setSequence(id) {
			_id = id;
		};
		
		this.isFromServer = function isFromServer() {
			return _is_from_server;
		};
		
		this.setServer = function setServer(state) {
			_is_from_server = state;
		};
		
		this.isResponse = function isResponse() {
			return _is_response;
		};
		
		this.setResponse = function setResponse(state) {
			_is_response = state;
		};
		
		this.addWord = function addWord(word) {
			_words.push(word);
		};
		
		this.getWords = function getWords() {
			return _words;
		};
		
		this.setWords = function setWords(words) {
			_words = words;
		};
		
		this.getNumWords = function getNumWords() {
			return _words.length;
		};
		
		this.getSize = function getSize() {
			var size		 = Packet.HEADER_SIZE;
			var length	= _words.length;
			
			for(var i = 0; i < length; i++) {
			   size += _words[i].length; 
			}

			return size + length * 5;
		};
		
		this.toString = function toString() {
			return '[Packet id="' + _id + '" server="' + _is_from_server + '" response="' + _is_response + '" words=[ "' + _words.join('," "')+ '" ]]';
		};
				
		this.getBytes = function getBytes() {
			var buffer		= new Buffer(this.getSize());
			var offset		= 0;

			offset		= Encoder.getSequence(buffer, offset, this);
			offset		= Encoder.getInfo(buffer, offset, this);
			Encoder.getWords(buffer, offset, this);

			return buffer;
		};
	};
	
	var net = require('net');
	var socket;
	this.host = undefined;
	this.port = 0,
	this.password = '';
	var _sequence = 0;
	var _packet_size = 0;
	
	this.init = function init(host, port, password) {
		this.host = host;
		this.port = port;
		this.password = password;
	};
	
	this.send = function send(packet) {
		console.log('[>>>]', packet.toString());
		socket.write(packet.getBytes());
	};
	
	var _packet_size = 0;
	var _packet_offset = 0;
	var _packets = {};
	var _packet_buffer = null;
	
	this.connect = function connect() {
		socket = net.connect({
			port:	this.port,
			host: this.host
		});
		
		socket.on('data', function(data) {
			var offset = 0;

			while(offset < data.length) {
				try {
					if (_packet_size == 0) {
						offset = this.waitForData(data, Packet.HEADER_SIZE, offset);

						if(offset) {
							_packet_size = Decoder.getPacketSize(_packet_buffer);
						} else {
							break;
						}
					}

					if(_packet_size && offset < data.length) {
						offset = this.waitForData(data, _packet_size, offset);

						if(offset) {
							var packet = Decoder.getPacket(_packet_buffer, _packet_size);

							console.log('[<<<]', packet.toString());
							if(packet.isFromServer()) {
								//$this.emit('admin.event', packet.getResponse(), packet);
							} else {
								var seq = packet.getSequence();

								if(packet.isOk()) {
									if(_packets[seq].callback !== undefined) {
										_packets[seq].callback.call($this, packet);
										packet = null;                        
									}
								} else {
									var requestPacket =_packets[seq].packet;
									//$this.emit('command.error', requestPacket.getWord(0), packet.getResponse(), requestPacket, packet);
								}

								delete _packets[seq];
							}

							_packet_size = 0;
							_packet_buffer.fill(0);
						} else {
							break;
						}
					}
				} catch(e) {
					console.log('exception', e);
					break;
				}
			}
		}.bind(this));
		
		socket.on('connect', function() {
			console.log('connected!');
			
			var packet = new Packet();
			packet.setSequence(_sequence++);
			packet.addWord('serverInfo');			
			this.send(packet);
		}.bind(this));
		
		socket.on('error', function(err) { console.log('error', err); });
		
		socket.on('close', function() {
			socket = null;
		}.bind(this));
	};
	
	this.waitForData = function waitForData(data, size, offset) {
		var copySize	= size - _packet_offset;
		var dataSize	= data.length - offset;
		
		if(copySize > dataSize) {
			data.copy(_packet_buffer, _packet_offset, offset);
			_packet_offset += dataSize;
			return 0;
		} else {
			var sourceEnd = offset + copySize;
			
			data.copy(_packet_buffer, _packet_offset, offset, sourceEnd);
			_packet_offset = size;
			return sourceEnd;
		}
	};
	
	this.init(host, port, password);
};