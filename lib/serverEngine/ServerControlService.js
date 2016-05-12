"use strict";

/*
 Server control service
 
 - Provides server control service
 - Map routes to sensors control
 - Map routes to actuators control
 - Map routes to nodes control
 - Map routes to nodes net control

 
 
 */

let EventEmitter = require('events').EventEmitter;
let portscanner = require('portscanner');
let express = require('express');


let SCS_RouteSensors = require('./scs_routes/SCS_RouteSensors.js');
let SCS_RouteActuators = require('./scs_routes/SCS_RouteActuators.js');
let SCS_RouteNodes = require('./scs_routes/SCS_RouteNodes.js');
let SCS_RouteNetNodes = require('./scs_routes/SCS_RouteNetNodes.js');




/**
 * ServerControlService CONSTANTS
 */
const ServerControlService_CONSTANTS = {
	"Events" : {
		"ConfigError": "Config Error",

		"ServerListening": "Server listening",
		"ServerClosed": "Server closed"

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
 * ServerControlService
 * 
 * Is the service for send and receive data control for Server administration
 * 
 */
class ServerControlService {
	
	constructor(stServer) {
		
		this.stServer = stServer;
		this.config = stServer.serverConfiguration.config;
		this.server = null;
		this.serverSocket = null;
		this.eventEmitter = new EventEmitter();
		
		this.CONSTANTS = ServerControlService_CONSTANTS;
		
		this.state = ServerControlService_CONSTANTS.States.Config;
		
		this.routes_Sensors = null;
		this.routes_Actuators = null;
		this.routes_Nodes = null;
		this.routes_NetNodes = null;
		
	}
	
	/**
	 * Start service
	 * 
	 * @throws Exceptions
	 */
	startService() {
		
		if (this.server != null) {
			 throw "Server is running";
		}
		
		let scs = this;
		
		scs.server = express();
//		scs.server.use(express.bodyParser());	// Middleware for use JSON on HTTP posts.
		scs.mapServiceRoutes();

		
//		DataChannel.portInUse( scs.config.server.controlPort, function(_portInUse) {
//			if (_portInUse) {
//				scs.eventEmitter.emit( scs.CONSTANTS.Events.ConfigError );
//			} else {
//				scs.serverSocket = scs.server.listen( scs.config.server.controlPort );
//				scs.eventEmitter.emit( scs.CONSTANTS.Events.ServerListening );
//			}
//		});
			
		
		// Checks the status of a single port
		portscanner.checkPortStatus(scs.config.server.controlPort, '127.0.0.1', function(error, status) {
		  // Status is 'open' if currently in use or 'closed' if available
		  
		  switch (status) {
			case 'closed':
				scs.serverSocket = scs.server.listen( scs.config.server.controlPort );
				scs.state = scs.CONSTANTS.States.Running;
				scs.eventEmitter.emit( scs.CONSTANTS.Events.ServerListening );
				break;
	
			default:
				scs.state = scs.CONSTANTS.States.Error;
				scs.eventEmitter.emit( scs.CONSTANTS.Events.ConfigError );
				break;
			}
		});
		
//		try {
//			scs.serverSocket = scs.server.listen( scs.config.server.controlPort );
//			scs.eventEmitter.emit( scs.CONSTANTS.Events.ServerListening );
//		} catch (e) {
//			// TODO: handle exception
//			scs.eventEmitter.emit( scs.CONSTANTS.Events.ConfigError );
//
//		}
		
	}
	
	/**
	 * Map Service routes
	 */
	mapServiceRoutes() {
		
		this.server.get('/', function(req, res){
			  res.send('ST Server Control Service');
			});

		this.routes_Sensors = new SCS_RouteSensors( this.stServer.sensorsManager );
		this.server.use('/Sensors', this.routes_Sensors.expressRoute);
		
		this.routes_Actuators = new SCS_RouteActuators( this.stServer.actuatorsManager );
		this.server.use('/Actuators', this.routes_Actuators.expressRoute);

		this.routes_Nodes = new SCS_RouteNodes( this.stServer.nodesManager );
		this.server.use('/Nodes', this.routes_Nodes.expressRoute);

		this.routes_NetNodes = new SCS_RouteNetNodes(this.stServer.nodesManager, this.stServer.nodesNetManager);
		this.server.use('/Net/Nodes', this.routes_NetNodes.expressRoute);

	}
	
	/**
	 * Stop service
	 * 
	 * @throws Exceptions
	 */
	stopService() {
	
		if (this.server == null) {
			 throw "Server not running";
		}
		
		if (this.state == this.CONSTANTS.States.Running) {
			this.serverSocket.close();
		}
		
		this.eventEmitter.emit( this.CONSTANTS.Events.ServerClosed );
		this.server = null;
		this.serverSocket = null;
	}
	
}



module.exports = ServerControlService;