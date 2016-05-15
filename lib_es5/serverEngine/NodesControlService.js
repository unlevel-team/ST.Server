"use strict";

/*
 Nodes Control service
 
 - Provides Nodes control service
 - Start/Stop service
 - Manage message [getSTNetworkInfo]->[STNetworkInfo]
 
 */

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var EventEmitter = require('events').EventEmitter;
var portscanner = require('portscanner');

var DataChannel = require('../stNetwork/DataChannel.js').DataChannel;

/**
 * NodesControlService CONSTANTS
 */
var NodesControlService_CONSTANTS = {
	"Events": {
		"ConfigError": "Config Error",

		"ServerListening": "Server listening",
		"ServerClosed": "Server closed",
		"NodeConnected": "Node Connected",
		"NodeDisconnected": "Node Disconnected"

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
 * NodesControlService
 * 
 * Is the service for send and receive data control with Nodes
 * 
 */

var NodesControlService = function () {
	function NodesControlService(config) {
		_classCallCheck(this, NodesControlService);

		this.config = config;
		this.server = null;
		this.serverSocket = null;
		this.eventEmitter = new EventEmitter();

		this.CONSTANTS = NodesControlService_CONSTANTS;

		this.state = NodesControlService_CONSTANTS.States.Config;
	}

	/**
  * Start service
  * 
  * @throws Exceptions
  */


	_createClass(NodesControlService, [{
		key: 'startService',
		value: function startService() {

			if (this.server != null) {
				throw "Server is running";
			}

			var ncs = this;

			ncs.server = require('socket.io')();

			ncs.server.on('connection', function (socket) {

				ncs.eventEmitter.emit(ncs.CONSTANTS.Events.NodeConnected, { "socket": socket });

				socket.on('disconnect', function () {
					ncs.eventEmitter.emit(ncs.CONSTANTS.Events.NodeDisconnected, { "socket": socket });
				});

				ncs.mapControlMessages(socket);
			});

			//		DataChannel.portInUse( ncs.config.nodes.controlPort, function(_portInUse) {
			//			if (_portInUse) {
			//				ncs.eventEmitter.emit( ncs.CONSTANTS.Events.ConfigError );
			//			} else {
			//				ncs.server.listen( ncs.config.nodes.controlPort );
			//				ncs.eventEmitter.emit( ncs.CONSTANTS.Events.ServerListening );
			//			}
			//		});

			// Checks the status of a single port
			portscanner.checkPortStatus(ncs.config.nodes.controlPort, '127.0.0.1', function (error, status) {
				// Status is 'open' if currently in use or 'closed' if available
				console.log(status);

				switch (status) {
					case 'closed':
						ncs.server.listen(ncs.config.nodes.controlPort);
						ncs.state = ncs.CONSTANTS.States.Running;
						ncs.eventEmitter.emit(ncs.CONSTANTS.Events.ServerListening);
						break;

					default:
						ncs.state = ncs.CONSTANTS.States.Error;
						ncs.eventEmitter.emit(ncs.CONSTANTS.Events.ConfigError);
						break;
				}
			});

			//		try {
			//			ncs.server.listen( ncs.config.nodes.controlPort );
			//			ncs.eventEmitter.emit( ncs.CONSTANTS.Events.ServerListening );
			//			
			//		} catch (e) {
			//			// TODO: handle exception
			//			ncs.eventEmitter.emit( ncs.CONSTANTS.Events.ConfigError );
			//
			//		}
		}

		/**
   * Map control messages
   */

	}, {
		key: 'mapControlMessages',
		value: function mapControlMessages(socket) {
			var ncs = this;

			// · · · · · ·  ¨¨¨  · · · · · ·  ¨¨¨  · · · · · ·  ¨¨¨  · · · · · · |\/|··· 
			// Message getSTNetworkInfo
			socket.on(ncs.CONSTANTS.Messages.getSTNetworkInfo, function (msg) {

				var dataMSG = {
					"serverType": "STServer",
					"version": process.env.npm_package_version,
					"controlPort": ncs.config.nodes.controlPort
				};

				socket.emit(ncs.CONSTANTS.Messages.STNetworkInfo, dataMSG);
			});
			// · · · · · ·  ¨¨¨  · · · · · ·  ¨¨¨  · · · · · ·  ¨¨¨  · · · · · · |/\|···
		}

		/**
   * Stop service
   * 
   * @throws Exceptions
   */

	}, {
		key: 'stopService',
		value: function stopService() {

			var ncs = this;

			if (ncs.server == null) {
				throw "Server not running";
			}

			if (ncs.state == ncs.CONSTANTS.States.Running) {
				ncs.server.close();
			}

			ncs.eventEmitter.emit(ncs.CONSTANTS.Events.ServerClosed);
			ncs.server = null;
		}
	}]);

	return NodesControlService;
}();

module.exports = NodesControlService;
//# sourceMappingURL=NodesControlService.js.map
