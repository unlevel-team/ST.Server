"use strict";

/*
 Nodes Control service

 - Provides Nodes control service
 - Start/Stop service
 - Manage message [getSTNetworkInfo]->[STNetworkInfo]

 */

let EventEmitter = require('events').EventEmitter;
let portscanner = require('portscanner');
let http = require('http');

let DataChannel = require('st.network').DataChannel;


/**
 * NodesControlService CONSTANTS
 */
const NodesControlService_CONSTANTS = {

	"Events" : {
		"ConfigError": "Config Error",

		"ServerListening": "Server listening",
		"ServerClosed": "Server closed",
		"NodeConnected": "Node Connected",
		"NodeDisconnected": "Node Disconnected"

	},

	"States" : {
		"Config" : "Config",
		"Running" : "Running",
		"Error" : "Error"
	},

	"Messages" : {
		"getSTNetworkInfo" : "Get STNetwork Info",
		"STNetworkInfo" : "STNetwork Info"

	}
};


/*
 * NodesControlService
 *
 * Is the service for send and receive control messages with Nodes
 *
 */
class NodesControlService {

	constructor(config) {

		this.config = config;
		this.server = null;
		this.socket = null;
		this.eventEmitter = new EventEmitter();

		this.CONSTANTS = NodesControlService_CONSTANTS;

		this.state = NodesControlService_CONSTANTS.States.Config;
	}


	/**
	 * Start service
	 *
	 * @throws Exceptions
	 */
	startService() {

		let ncs = this;

		if (ncs.server !== null) {
			 throw "Server is running";
		}

		ncs.server = require('socket.io')();
		ncs.socket = ncs.server;

		// Map event connection... provides a new socket
		ncs.server.on('connection', function(socket){

			// Emit event NodeConnected
			ncs.eventEmitter.emit( ncs.CONSTANTS.Events.NodeConnected , {"socket" : socket} );

			socket.on('disconnect', function(){
				
				// Emit event NodeDisconnected
				ncs.eventEmitter.emit( ncs.CONSTANTS.Events.NodeDisconnected , {"socket" : socket} );

			});

			ncs.mapControlMessages(socket);

		});


		// Checks the status of a single port
		portscanner.checkPortStatus(ncs.config.nodes.controlPort, '127.0.0.1', function(error, status) {
		  // Status is 'open' if currently in use or 'closed' if available
		  // console.log(status)

		  switch (status) {
			case 'closed':
				
				if (ncs.config.nodes.netLocation === "0.0.0.0") {
					ncs.server.listen( ncs.config.nodes.controlPort );
				} else {
					
					// Connect socket.IO to any IP...
					ncs._server = http.createServer();
					ncs._server.listen(
							ncs.config.nodes.controlPort, 
							ncs.config.nodes.netLocation);
					
					ncs.server.listen( ncs._server );
				}
				
				ncs.state = ncs.CONSTANTS.States.Running;
				ncs.eventEmitter.emit( ncs.CONSTANTS.Events.ServerListening ); // Emit event ServerListening
				break;

			default:
				ncs.state = ncs.CONSTANTS.States.Error;
				ncs.eventEmitter.emit( ncs.CONSTANTS.Events.ConfigError ); // Emit event ConfigError
				break;
			}
		});

	}


	/**
	 * Map control messages
	 */
	mapControlMessages(socket){
		let ncs = this;

		  // Map Message getSTNetworkInfo
		  socket.on( ncs.CONSTANTS.Messages.getSTNetworkInfo, function(msg){

			  let dataMSG = {
				"serverType" : "STServer",
				"version" : process.env.npm_package_version,
				"controlPort" : ncs.config.nodes.controlPort
			  };

			  socket.emit(ncs.CONSTANTS.Messages.STNetworkInfo, dataMSG);	// Send Message STNetworkInfo

		  });
	}


	/**
	 * Stop service
	 *
	 * @throws Exceptions
	 */
	stopService() {

		let ncs = this;

		if (ncs.server === null) {
			 throw "Server not running";
		}


		if (ncs.state === ncs.CONSTANTS.States.Running) {
			ncs.server.close();
		}

		ncs.eventEmitter.emit( ncs.CONSTANTS.Events.ServerClosed );	// Emit event ServerClosed
		ncs.server = null;
	}
	
}


module.exports = NodesControlService;
