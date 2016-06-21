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


/**
 * SCS_RouteRef
 * 
 * Provides reference to SCS routes
 * 
 */
class SCS_RouteRef {
	
	constructor(expressRoute, url) {
		
		let scs_Route = this;
		
		scs_Route.expressRoute = expressRoute;
		scs_Route.url = url;
	}
	
	
}


/*
 * ServerControlService
 * 
 * Is the service for send and receive data control for Server administration
 * 
 */
class ServerControlService {
	
	constructor(stServer) {
		
		let scs = this;
		
		scs.stServer = stServer;
		scs.config = stServer.serverConfiguration.config;
		scs.server = null;
		scs.serverSocket = null;
		scs.eventEmitter = new EventEmitter();
		
		scs.CONSTANTS = ServerControlService_CONSTANTS;
		
		scs.state = ServerControlService_CONSTANTS.States.Config;
		
		
		scs._scsRoutes = null;
		
		scs.routes_Nodes = null;
		scs.routes_Engines = null;
		scs.routes_Sensors = null;
		scs.routes_Actuators = null;
		scs.routes_Net = null;
		
	}
	
	
	initialize() {
		
		let scs = this;
		
		scs._scsRoutes = [];
		
		
		scs._init_Nodes();
		scs._init_Engines__OLD();
		scs._init_Net();
		
		
	}
	
	
	/**
	 * Initialize control routes 
	 * for nodes
	 */
	_init_Nodes() {
		
		let scs = this;
		
		let SCS_RouteNodes = require('./scs_routes/SCS_RouteNodes.js');

		scs.routes_Nodes = new SCS_RouteNodes( scs.stServer.nodesManager );
		let scsRoutes_Nodes = new SCS_RouteRef(scs.routes_Nodes.expressRoute, "/Nodes");
		scs._scsRoutes.push(scsRoutes_Nodes);
		
	}
	
	
	/**
	 * Initialize control routes 
	 * for Engines
	 * 
	 * - old version -
	 */
	_init_Engines__OLD() {
		
		let scs = this;
		
		let SCS_RouteSensors = require('./scs_routes/SCS_RouteSensors.js');
		let SCS_RouteActuators = require('./scs_routes/SCS_RouteActuators.js');
		
		scs.routes_Sensors = new SCS_RouteSensors( scs.stServer.sensorsManager );
		let scsRoutes_Sensor = new SCS_RouteRef(scs.routes_Sensors.expressRoute, "/Sensors");
		scs._scsRoutes.push(scsRoutes_Sensor);
		
		
		scs.routes_Actuators = new SCS_RouteActuators( scs.stServer.actuatorsManager );
		let scsRoutes_Actuators = new SCS_RouteRef(scs.routes_Actuators.expressRoute, "/Actuators");
		scs._scsRoutes.push(scsRoutes_Actuators);
		
	}
	
	
	/**
	 * Initialize control routes 
	 * for Engines
	 */
	_init_Engines() {
		
		let scs = this;
		let stServer = scs.stServer;
		let ngSYS = stServer.ngSYS;
		
		scs.routes_Engines = ngSYS.getSCSRoutes();
		
		let scsRoutes_Engines = new SCS_RouteRef(scs.routes_Engines.expressRoute, "/ngn");
		scs._scsRoutes.push(scsRoutes_Engines);
	}
	
	
	/**
	 * Initialize control routes 
	 * for Net
	 */
	_init_Net() {
		
		let scs = this;
		
		let SCS_RouteNet = require('st.network').get_SCS_RouteNet();
		
		scs.routes_Net = new SCS_RouteNet(
				scs.stServer.nodesManager, 
				scs.stServer.nodesNetManager, 
				scs.stServer.serverNetManager);
		
		let scsRoutes_Net = new SCS_RouteRef(scs.routes_Net.expressRoute, "/Net");
		scs._scsRoutes.push(scsRoutes_Net);
		
	}
	
	
	/**
	 * Start service
	 * 
	 * @throws Exceptions
	 */
	startService() {
		
		let scs = this;
		
		if (scs.server !== null) {
			 throw "Server is running";
		}
		
		scs.server = express();
//		scs.server.use(express.bodyParser());	// Middleware for use JSON on HTTP posts.
		scs.mapServiceRoutes();

		
		/*
		 
		DataChannel.portInUse( scs.config.server.controlPort, function(_portInUse) {
			if (_portInUse) {
				scs.eventEmitter.emit( scs.CONSTANTS.Events.ConfigError );
			} else {
				scs.serverSocket = scs.server.listen( scs.config.server.controlPort );
				scs.eventEmitter.emit( scs.CONSTANTS.Events.ServerListening );
			}
		});
		
		*/
		
		
		// Checks the status of a single port
		portscanner.checkPortStatus(scs.config.server.controlPort, scs.config.server.netLocation, function(error, status) {
		  // Status is 'open' if currently in use or 'closed' if available
		  
		  switch (status) {
		  
			case 'closed':
				
				
				scs.serverSocket = scs.server.listen( scs.config.server.controlPort, scs.config.server.netLocation );
//				scs.serverSocket = scs.server.listen( scs.config.server.controlPort );
				
				scs.state = scs.CONSTANTS.States.Running;
				scs.eventEmitter.emit( scs.CONSTANTS.Events.ServerListening );
				break;
	
			default:
				scs.state = scs.CONSTANTS.States.Error;
				scs.eventEmitter.emit( scs.CONSTANTS.Events.ConfigError );
				break;
			}
		});
		
		
		/*
		 
		try {
			scs.serverSocket = scs.server.listen( scs.config.server.controlPort );
			scs.eventEmitter.emit( scs.CONSTANTS.Events.ServerListening );
		} catch (e) {
			// TODO: handle exception
			scs.eventEmitter.emit( scs.CONSTANTS.Events.ConfigError );

		}

		*/
	}
	
	
	/**
	 * Map Service routes
	 */
	mapServiceRoutes() {
		
		let scs = this;
		
		scs.server.get('/', function(req, res){
			  res.send('ST Server Control Service');
			});
		
		scs._scsRoutes.forEach(function(_route, _i) {
			scs.server.use(_route.url, _route.expressRoute);
		});
		
		
		/*
		 
		scs.routes_Sensors = new SCS_RouteSensors( scs.stServer.sensorsManager );
		scs.server.use('/Sensors', scs.routes_Sensors.expressRoute);
		
		scs.routes_Actuators = new SCS_RouteActuators( scs.stServer.actuatorsManager );
		scs.server.use('/Actuators', scs.routes_Actuators.expressRoute);

		scs.routes_Nodes = new SCS_RouteNodes( scs.stServer.nodesManager );
		scs.server.use('/Nodes', scs.routes_Nodes.expressRoute);

		scs.routes_Net = new SCS_RouteNet(scs.stServer.nodesManager, scs.stServer.nodesNetManager, scs.stServer.serverNetManager);
		scs.server.use('/Net', scs.routes_Net.expressRoute);
		
		*/
		
	}
	
	
	/**
	 * Stop service
	 * 
	 * @throws Exceptions
	 */
	stopService() {
		
		let scs = this;
	
		if (scs.server === null) {
			 throw "Server not running";
		}
		
		if (scs.state === scs.CONSTANTS.States.Running) {
			scs.serverSocket.close();
		}
		
		scs.eventEmitter.emit( scs.CONSTANTS.Events.ServerClosed );
		scs.server = null;
		scs.serverSocket = null;
	}
	
}

module.exports = ServerControlService;