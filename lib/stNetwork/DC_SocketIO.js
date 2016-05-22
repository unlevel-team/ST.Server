"use strict";

/**
 * DC_SocketIO library
 * 
 * Provides data channel to ST network based on socket.io
 * 
 * 
 */

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
		
		let dc = this;
		
		super.initDataChannel();
		
		switch ( dc.config.mode ) {
		case dc.CONSTANTS.Config.modeIN:
			dc.initDC_modeIN();
			break;
		case dc.CONSTANTS.Config.modeOUT:
			dc.initDC_modeOUT();
			break;
		default:
			break;
		}
		
	}
	
	/**
	 * Initialize mode IN
	 */
	initDC_modeIN() {
		
		let dc = this;
		
		if (dc.server != null) {
			 throw "Server is initialized";
		}
		
		// Map event: Channel stop
		dc.eventEmitter.on( dc.CONSTANTS.Events.ChannelStop, function() {
			dc.server.close();
			dc.state = dc.CONSTANTS.States.DCstate_Stop;
			dc.eventEmitter.emit( dc.CONSTANTS.Events.ChannelStopped );
		});

		// Map event: Channel start
		dc.eventEmitter.on( dc.CONSTANTS.Events.ChannelStart, function() {
			dc.server.listen( dc.config.socketPort );	// listen on Socket port
			dc.eventEmitter.emit( dc.CONSTANTS.Events.ChannelStarted );
		});

		dc.server = require('socket.io')();
		
		// Map connection of Socket
		dc.server.on('connection', function(socket){	
			
			dc.eventEmitter.emit( dc.CONSTANTS.Events.ClientConnected , {"socket" : socket} );	// Emit event ClientConnected
			  
			// Map disconnection of Socket
			socket.on('disconnect', function(){	
				dc.eventEmitter.emit( dc.CONSTANTS.Events.ClientDisconnected , {"socket" : socket} );	// Emit event ClientDisconnected

			});
			  
			// Map message of Socket
			socket.on( dc.CONSTANTS.Messages.DataMessage , function(msg){	
				dc.eventEmitter.emit( dc.CONSTANTS.Events.MessageReceived , msg );	// Emit event MessageReceived

			});
			  
		});

		
		dc.eventEmitter.on( dc.CONSTANTS.Events.MainLoop_Tick, function() {	// Map event MainLoop_Tick
			dc.socket.emit(dc.CONSTANTS.Messages.DataMessage , dc.messagesList);	// Emit messages to socket
			dc.messagesList = [];
		});
		
		

		dc.eventEmitter.emit( dc.CONSTANTS.Events.ChannelInitialized );	// Emit event Channel initialized
	}
	
	
	/**
	 * Initialize mode OUT
	 */
	initDC_modeOUT() {
		
		let dc = this;
		
		if (dc.socket != null) {
			 throw "Socket is initialized";
		}
		
		
		dc._serverURL = 'http://' + dc.config.netLocation + ':' + dc.config.socketPort;

		
		// Map event: Channel stop
		dc.eventEmitter.on( dc.CONSTANTS.Events.ChannelStop, function() {
			dc.socket.close();
			dc.state = dc.CONSTANTS.States.DCstate_Stop;
			dc.eventEmitter.emit( dc.CONSTANTS.Events.ChannelStopped );
		});
		
		
		// Map event ChannelStart
		dc.eventEmitter.on( dc.CONSTANTS.Events.ChannelStart, function() {

			dc.socket = require('socket.io-client')(dc._serverURL);	// connect to server
			
			// Map event connect
			dc.socket.on('connect', function(){	
				dc.eventEmitter.emit( dc.CONSTANTS.Events.ChannelStarted );	// Emit event ChannelStarted
				  
			});

			// Map event disconnect
			dc.socket.on('disconnect', function(){	
				dc.eventEmitter.emit( dc.CONSTANTS.Events.ChannelStop );	// Emit event ChannelStop

			});
			
			// Map message of Socket
			dc.socket.on( dc.CONSTANTS.Messages.DataMessage , function(msg){	
				dc.eventEmitter.emit( dc.CONSTANTS.Events.MessageReceived , msg );	// Emit event MessageReceived

			});

		});
		
		
		// Map event MainLoop_Tick
		dc.eventEmitter.on( dc.CONSTANTS.Events.MainLoop_Tick, function() {	
			dc.socket.emit(dc.CONSTANTS.Messages.DataMessage , dc.messagesList);	// Emit messages to socket
			dc.messagesList = [];
		});
		
		
		dc.state = dc.CONSTANTS.States.DCstate_Ready;	// Change state to Ready
		dc.eventEmitter.emit( dc.CONSTANTS.Events.ChannelInitialized );	// Emit event: Channel initialized

	}
	
	
}


module.exports = DC_SocketIO;