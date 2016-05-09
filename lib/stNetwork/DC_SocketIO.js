"use strict";


let EventEmitter = require('events').EventEmitter;
let DataChannel = require('./DataChannel.js').DataChannel;


/**
 * Data Channel for Socket.io type
 */
class DC_SocketIO extends DataChannel {
	
	constructor(config) {
		super(config);
	}
	
	/**
	 * Initialize data channel
	 */
	initDataChannel() {
		super.initDataChannel();
		
		switch ( this.config.mode ) {
		case this.CONSTANTS.Config.modeIN:
			this.initDC_modeIN();
			break;
		case this.CONSTANTS.Config.modeOUT:
			this.initDC_modeOUT();
			break;
		default:
			break;
		}
		
	}
	
	/**
	 * Initialize mode IN
	 */
	initDC_modeIN() {
		
		if (this.server != null) {
			 throw "Server is initialized";
		}
		
		let dataChannel = this;
		
		// Map event: Channel stop
		dataChannel.eventEmitter.on( dataChannel.CONSTANTS.Events.ChannelStop, function() {
			dataChannel.server.close();
			dataChannel.state = dataChannel.CONSTANTS.States.DCstate_Stop;
			dataChannel.eventEmitter.emit( dataChannel.CONSTANTS.Events.ChannelStopped );
		});

		// Map event: Channel start
		dataChannel.eventEmitter.on( dataChannel.CONSTANTS.Events.ChannelStart, function() {
			dataChannel.server.listen( this.config.socketPort );	// listen on Socket port
			dataChannel.eventEmitter.emit( dataChannel.CONSTANTS.Events.ChannelStarted );
		});

		this.server = require('socket.io')();
		
		this.server.on('connection', function(socket){	// Map connection of Socket
			
			dataChannel.eventEmitter.emit( dataChannel.CONSTANTS.Events.ClientConnected , {"socket" : socket} );
			  
			  socket.on('disconnect', function(){	// Map disconnection of Socket
				  dataChannel.eventEmitter.emit( dataChannel.CONSTANTS.Events.ClientDisconnected , {"socket" : socket} );

			  });
			  
			  socket.on( dataChannel.CONSTANTS.Messages.DataMessage , function(msg){	// Map message of Socket
				  dataChannel.eventEmitter.emit( dataChannel.CONSTANTS.Events.MessageReceived , msg );

			  });
			  
			});


		dataChannel.eventEmitter.emit( dataChannel.CONSTANTS.Events.ChannelInitialized );	// Emit event: Channel initialized
	}
	
	
	/**
	 * Initialize mode OUT
	 */
	initDC_modeOUT() {
		if (this.socket != null) {
			 throw "Socket is initialized";
		}
		
		let dataChannel = this;
		dataChannel._serverURL = 'http://' + dataChannel.config.netLocation + ':' + dataChannel.config.socketPort;

		
		// Map event: Channel start
		dataChannel.eventEmitter.on( dataChannel.CONSTANTS.Events.ChannelStart, function() {

			ddataChannel.socket = require('socket.io-client')(dataChannel._serverURL);	// connect to server
			
			ddataChannel.socket.on('connect', function(){	// Map connection to Server
				dataChannel.eventEmitter.emit( dataChannel.CONSTANTS.Events.ChannelStarted );
				  
			});

			ddataChannel.socket.on('disconnect', function(){	// Map disconnection from Server
				dataChannel.eventEmitter.emit( dataChannel.CONSTANTS.Events.ChannelStop );

			});

		});
		
		
		ddataChannel.eventEmitter.on( dataChannel.CONSTANTS.Events.MainLoop_Tick, function() {	// Map main loop tick
			dataChannel.socket.emit(dataChannel.CONSTANTS.Messages.DataMessage , dataChannel.messagesList);
			dataChannel.messagesList = [];
		});
		
		this.state = this.CONSTANTS.States.DCstate_Ready;	// Change state to Ready
		this.eventEmitter.emit( this.CONSTANTS.Events.ChannelInitialized );	// Emit event: Channel initialized

	}
	
	
}


module.exports = DC_SocketIO;