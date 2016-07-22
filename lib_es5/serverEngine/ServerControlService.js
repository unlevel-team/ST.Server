"use strict";

/*
 Server control service
 
 - Provides server control service
 - Map routes to sensors control
 - Map routes to actuators control
 - Map routes to nodes control
 - Map routes to nodes net control
 
 */

/**
 * import EventEmitter
 * @ignore
 */

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var EventEmitter = require('events').EventEmitter;

/**
 * import portscanner
 * @ignore
 */
var portscanner = require('portscanner');

/**
 * import express
 * @ignore
 */
var express = require('express');

/**
 * ServerControlService CONSTANTS
 * @memberof st.serverEngine
 */
var ServerControlService_CONSTANTS = {
	"Events": {
		"ConfigError": "Config Error",

		"ServerListening": "Server listening",
		"ServerClosed": "Server closed"

	},

	"States": {
		"Config": "Config",
		"Running": "Running",
		"Error": "Error"
	},

	"Messages": {
		"getSTNetworkInfo": "Get STNetwork Info",
		"STNetworkInfo": "STNetwork Info"

	}
};

/**
 * SCS_RouteRef
 * <pre>
 * Provides reference to SCS routes
 * </pre>
 * 
 * @class
 * @memberof st.serverEngine
 * 
 * @property {object} expressRoute - Express route object
 * @property {string} url - URL for the route
 * 
 */

var SCS_RouteRef =

/**
 * 
 * @constructs SCS_RouteRef
 * 
 * @param {object} expressRoute - Express route object
 * @param {string} url - URL for the route
 * 
 */
function SCS_RouteRef(expressRoute, url) {
	_classCallCheck(this, SCS_RouteRef);

	var scs_Route = this;

	scs_Route.expressRoute = expressRoute;
	scs_Route.url = url;
};

/**
 * ServerControlService
 * <pre>
 * Is the service for send and receive data control for Server administration
 * </pre>
 * 
 * @class
 * @memberof st.serverEngine
 * 
 * @property {st.serverEngine.STServer} stServer - ST Server object
 * @property {object} config - ST Server configuration object
 * @property {object} server - Server 
 * @property {object} serverSocket - Server socket
 * @property {object} eventEmitter - Object for emit events
 * 
 * @property {string} state - State
 * 
 * @property {object} _scsRoutes - Express routes object
 * @property {object} routes_Nodes - Routes for Nodes
 * @property {object} routes_Engines - Routes for Engines
 * @property {object} routes_Net - Routes for Net
 * 
 * @property {number} messages - Number of messages
 * 
 */


var ServerControlService = function () {

	/**
  * 
  * @constructs ServerControlService
  * 
  * @param {STServer} stServer - ST Server object
  */

	function ServerControlService(stServer) {
		_classCallCheck(this, ServerControlService);

		var scs = this;

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
		//		scs.routes_Sensors = null;
		//		scs.routes_Actuators = null;
		scs.routes_Net = null;

		scs.messages = 0;
	}

	/**
  * Initialize
  */


	_createClass(ServerControlService, [{
		key: 'initialize',
		value: function initialize() {

			var scs = this;

			scs._scsRoutes = [];

			try {
				scs._init_Nodes();
			} catch (e) {
				// TODO: handle exception
				throw "Cannont initialize Nodes. " + e;
			}

			try {
				scs._init_Engines();
			} catch (e) {
				// TODO: handle exception
				throw "Cannont initialize Engines. " + e;
			}

			try {
				scs._init_Net();
			} catch (e) {
				// TODO: handle exception
				throw "Cannont initialize Net. " + e;
			}
		}

		/**
   * Initialize control routes 
   * for nodes
   */

	}, {
		key: '_init_Nodes',
		value: function _init_Nodes() {

			var scs = this;

			var SCS_RouteNodes = require('./scs_routes/SCS_RouteNodes.js');

			console.log('<~*~> ServerControlService._init_Nodes'); // TODO REMOVE DEBUG LOG

			scs.routes_Nodes = new SCS_RouteNodes(scs.stServer.nodesManager);
			var scsRoutes_Nodes = new SCS_RouteRef(scs.routes_Nodes.expressRoute, "/Nodes");
			scs._scsRoutes.push(scsRoutes_Nodes);
		}

		/**
   * Initialize control routes 
   * for Engines
   */

	}, {
		key: '_init_Engines',
		value: function _init_Engines() {

			var scs = this;
			var stServer = scs.stServer;
			var ngSYS = stServer.ngSYS;

			console.log('<~*~> ServerControlService._init_Engines'); // TODO REMOVE DEBUG LOG

			try {

				scs.routes_Engines = ngSYS.getSCSRoutes({
					"ngSYS": ngSYS

				});
			} catch (e) {
				// TODO: handle exception
				throw "Cannot get SCS Routes. " + e;
			}

			var scsRoutes_Engines = new SCS_RouteRef(scs.routes_Engines.expressRoute, "/ngn");
			scs._scsRoutes.push(scsRoutes_Engines);
		}

		/**
   * Initialize control routes 
   * for Net
   */

	}, {
		key: '_init_Net',
		value: function _init_Net() {

			var scs = this;

			console.log('<~*~> ServerControlService._init_Net'); // TODO REMOVE DEBUG LOG

			var SCS_RouteNet = require('st.network').get_SCS_RouteNet();

			scs.routes_Net = new SCS_RouteNet(scs.stServer.nodesManager, scs.stServer.nodesNetManager, scs.stServer.serverNetManager);

			var scsRoutes_Net = new SCS_RouteRef(scs.routes_Net.expressRoute, "/Net");
			scs._scsRoutes.push(scsRoutes_Net);
		}

		/**
   * Start service
   * 
   * @throws Exceptions
   */

	}, {
		key: 'startService',
		value: function startService() {

			var scs = this;

			if (scs.server !== null) {
				throw "Server is running";
			}

			scs.server = express();
			//		scs.server.use(express.bodyParser());	// Middleware for use JSON on HTTP posts.
			scs.mapServiceRoutes();

			console.log('<~*~> ST Server.ServerControlService.startService'); // TODO REMOVE DEBUG LOG

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
			portscanner.checkPortStatus(scs.config.server.controlPort, scs.config.server.netLocation, function (error, status) {
				// Status is 'open' if currently in use or 'closed' if available

				switch (status) {

					case 'closed':

						scs.serverSocket = scs.server.listen(scs.config.server.controlPort, scs.config.server.netLocation);
						//				scs.serverSocket = scs.server.listen( scs.config.server.controlPort );

						scs.state = scs.CONSTANTS.States.Running;
						scs.eventEmitter.emit(scs.CONSTANTS.Events.ServerListening);
						break;

					default:
						scs.state = scs.CONSTANTS.States.Error;
						scs.eventEmitter.emit(scs.CONSTANTS.Events.ConfigError);
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

	}, {
		key: 'mapServiceRoutes',
		value: function mapServiceRoutes() {

			var scs = this;

			scs.server.get('/', function (req, res) {
				res.send('ST Server Control Service');
			});

			scs._scsRoutes.forEach(function (_route, _i) {
				scs.server.use(_route.url, _route.expressRoute);
			});

			// middleware that is specific to this router
			scs.server.use(function messageCount(req, res, next) {

				scs.messages++;
				//			res.header("Access-Control-Allow-Origin", "*");
				//		  	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

				//			res.setHeader('Access-Control-Allow-Origin', '*');
				next();
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

	}, {
		key: 'stopService',
		value: function stopService() {

			var scs = this;

			if (scs.server === null) {
				throw "Server not running";
			}

			console.log('<~*~> ST Server.ServerControlService.stopService'); // TODO REMOVE DEBUG LOG

			if (scs.state === scs.CONSTANTS.States.Running) {
				scs.serverSocket.close();
			}

			scs.eventEmitter.emit(scs.CONSTANTS.Events.ServerClosed);
			scs.server = null;
			scs.serverSocket = null;
		}
	}]);

	return ServerControlService;
}();

module.exports = ServerControlService;
//# sourceMappingURL=ServerControlService.js.map
