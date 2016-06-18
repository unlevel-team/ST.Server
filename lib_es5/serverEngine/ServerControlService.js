"use strict";

/*
 Server control service
 
 - Provides server control service
 - Map routes to sensors control
 - Map routes to actuators control
 - Map routes to nodes control
 - Map routes to nodes net control
 
 */

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var EventEmitter = require('events').EventEmitter;
var portscanner = require('portscanner');
var express = require('express');

var SCS_RouteSensors = require('./scs_routes/SCS_RouteSensors.js');
var SCS_RouteActuators = require('./scs_routes/SCS_RouteActuators.js');
var SCS_RouteNodes = require('./scs_routes/SCS_RouteNodes.js');

var SCS_RouteNet = require('st.network').get_SCS_RouteNet();

/**
 * ServerControlService CONSTANTS
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

/*
 * ServerControlService
 * 
 * Is the service for send and receive data control for Server administration
 * 
 */

var ServerControlService = function () {
	function ServerControlService(stServer) {
		_classCallCheck(this, ServerControlService);

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
		this.routes_Net = null;
	}

	/**
  * Start service
  * 
  * @throws Exceptions
  */


	_createClass(ServerControlService, [{
		key: 'startService',
		value: function startService() {

			var scs = this;

			if (scs.server !== null) {
				throw "Server is running";
			}

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

	}, {
		key: 'mapServiceRoutes',
		value: function mapServiceRoutes() {

			var scs = this;

			scs.server.get('/', function (req, res) {
				res.send('ST Server Control Service');
			});

			scs.routes_Sensors = new SCS_RouteSensors(scs.stServer.sensorsManager);
			scs.server.use('/Sensors', scs.routes_Sensors.expressRoute);

			scs.routes_Actuators = new SCS_RouteActuators(scs.stServer.actuatorsManager);
			scs.server.use('/Actuators', scs.routes_Actuators.expressRoute);

			scs.routes_Nodes = new SCS_RouteNodes(scs.stServer.nodesManager);
			scs.server.use('/Nodes', scs.routes_Nodes.expressRoute);

			scs.routes_Net = new SCS_RouteNet(scs.stServer.nodesManager, scs.stServer.nodesNetManager, scs.stServer.serverNetManager);
			scs.server.use('/Net', scs.routes_Net.expressRoute);
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
