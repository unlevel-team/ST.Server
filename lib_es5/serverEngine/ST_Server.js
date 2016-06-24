"use strict";

/*
 ST Server
 SomeThings Server
 
 
 - Provides the main class of ST server
 - Load configuration
 - Start managers
 - Start services
 - byebye for shutdown

 */

// require our modules

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ServerConfiguration = require('./ServerConfiguration.js');

var NodesControlService = require('./NodesControlService.js');
var NodesManager = require('./NodesManager.js');

var ServerControlService = require('./ServerControlService.js');

var readline = require('readline');

/**
 * ST Server
 */

var STServer = function () {
	function STServer() {
		_classCallCheck(this, STServer);

		var stServer = this;

		stServer.serverConfiguration = null;

		stServer.ngSYS = null;
		stServer.sensorsManager = null;
		stServer.actuatorsManager = null;

		stServer.nodesManager = null;
		stServer.nodesControlService = null;

		stServer.nodesNetManager = null;
		stServer.nodesNetService = null;
		stServer.serverControlService = null;

		stServer.miniCLI = null;
	}

	/**
  * Initialize ST Server
  */


	_createClass(STServer, [{
		key: 'init_Server',
		value: function init_Server() {

			var stServer = this;

			stServer.loadConfig();

			//		stServer._init_EnginesSystem__OLD();

			stServer._init_NodesManager();
			stServer._init_NodesControlService();

			stServer._init_EnginesSystem();
		}

		/**
   * Load configuration
   */

	}, {
		key: 'loadConfig',
		value: function loadConfig() {

			var stServer = this;

			if (stServer.serverConfiguration !== null) {
				throw 'Server configuration is loaded.';
			}

			// --- ~~ --- ~~ --- ~~ --- ~~ ---
			// Server configuration
			// -------------------------------------------------------------------------------|\/|---
			stServer.serverConfiguration = new ServerConfiguration();

			stServer.serverConfiguration.readFile();

			if (stServer.serverConfiguration.config === null) {

				console.log('Error in configuration'); // TODO REMOVE DEBUG LOG

				process.exit(0);
				//			return -1;
			}
			console.log('<*> ST Server'); // TODO REMOVE DEBUG LOG
			console.log(' <~~~> ServerConfiguration'); // TODO REMOVE DEBUG LOG
			console.log(stServer.serverConfiguration.config); // TODO REMOVE DEBUG LOG

			//-------------------------------------------------------------------------------|/\|---
		}

		/**
   * Initialize Nodes manager
   */

	}, {
		key: '_init_NodesManager',
		value: function _init_NodesManager() {

			var stServer = this;

			if (stServer.nodesManager !== null) {
				throw 'Nodes manager initialized.';
			}

			//--- ~~ --- ~~ --- ~~ --- ~~ ---
			// Nodes Manager
			//-------------------------------------------------------------------------------|\/|---
			stServer.nodesManager = new NodesManager();
			var nmgr = stServer.nodesManager;

			// Map event NodeAdded
			nmgr.eventEmitter.on(nmgr.CONSTANTS.Events.NodeAdded, function (data) {
				console.log('<*> ST Server.nodesManager'); // TODO REMOVE DEBUG LOG
				console.log(' <~~~> Events.NodeAdded'); // TODO REMOVE DEBUG LOG

				//			stServer.sensorsManager.addSensorsFromNode( data.node );	// bind Node to Sensors manager
				//			stServer.actuatorsManager.addActuatorsFromNode( data.node );	// bind Node to Actuators manager
			});

			// Map event NodeRemoved
			nmgr.eventEmitter.on(nmgr.CONSTANTS.Events.NodeRemoved, function (data) {
				console.log('<*> ST Server.nodesManager'); // TODO REMOVE DEBUG LOG
				console.log(' <~~~> Events.NodeRemoved'); // TODO REMOVE DEBUG LOG
			});
			//-------------------------------------------------------------------------------|/\|---
		}

		/**
   * Initialize engines system
   * 
   */

	}, {
		key: '_init_EnginesSystem',
		value: function _init_EnginesSystem() {

			var stServer = this;

			if (stServer.ngSYS !== null) {
				throw 'Engines System initialized.';
			}

			var STEngines = require('st.engines');

			//--- ~~ --- ~~ --- ~~ --- ~~ ---
			// Engines System
			//
			// Set role Server & control channel
			var ngSYSconfig = {

				"role": "Server",
				"controlChannel": stServer.nodesControlService,

				"nodesManager": stServer.nodesManager
			};

			try {
				stServer.ngSYS = STEngines.getEnginesSystem(ngSYSconfig);

				stServer.ngSYS.initialize();

				stServer.sensorsManager = stServer.ngSYS.sensorsManager;
				stServer.actuatorsManager = stServer.ngSYS.actuatorsManager;
			} catch (e) {
				// TODO: handle exception
				throw "Cannot initialize engines system. " + e;
			}
		}

		/**
   * Initialize Nodes Control Service
   */

	}, {
		key: '_init_NodesControlService',
		value: function _init_NodesControlService() {

			var stServer = this;

			if (stServer.nodesControlService !== null) {
				throw 'Nodes Control Service initialized.';
			}

			var config = stServer.serverConfiguration.config;

			//--- ~~ --- ~~ --- ~~ --- ~~ ---
			// Nodes control Service
			//-------------------------------------------------------------------------------|\/|---

			stServer.nodesControlService = new NodesControlService(config);

			var ncsrv = stServer.nodesControlService;

			ncsrv.eventEmitter.on(ncsrv.CONSTANTS.Events.ConfigError, function (data) {
				console.log('EEE> ST Server.ConfigError'); // TODO REMOVE DEBUG LOG
				console.log(' <~~~> Configuration error.'); // TODO REMOVE DEBUG LOG
				stServer._byebye();
			});

			ncsrv.eventEmitter.on(ncsrv.CONSTANTS.Events.ServerListening, function (data) {
				console.log('<*> ST Server.nodesControlService'); // TODO REMOVE DEBUG LOG
				console.log(' <~~~> Server Listening'); // TODO REMOVE DEBUG LOG
			});

			ncsrv.eventEmitter.on(ncsrv.CONSTANTS.Events.ServerClosed, function (data) {
				console.log('<*> ST Server.nodesControlService'); // TODO REMOVE DEBUG LOG
				console.log(' <~~~> Server Closed'); // TODO REMOVE DEBUG LOG
			});

			ncsrv.eventEmitter.on(ncsrv.CONSTANTS.Events.NodeConnected, function (data) {
				console.log('<*> ST Server.nodesControlService'); // TODO REMOVE DEBUG LOG
				console.log(' <~~~> Events.NodeConnected'); // TODO REMOVE DEBUG LOG

				stServer.nodesManager.addNode(null, data.socket);
			});

			ncsrv.eventEmitter.on(ncsrv.CONSTANTS.Events.NodeDisconnected, function (data) {
				console.log('<*> ST Server.nodesControlService'); // TODO REMOVE DEBUG LOG
				console.log(' <~~~> Events.NodeDisconnected'); // TODO REMOVE DEBUG LOG
			});

			try {
				ncsrv.startService();
			} catch (e) {
				// TODO: handle exception
				console.log('Cannot start the service'); // TODO REMOVE DEBUG LOG
			}
			//-------------------------------------------------------------------------------|/\|---
		}

		/**
   * Initialize ST Network
   */

	}, {
		key: 'init_STNetwork',
		value: function init_STNetwork(options) {

			var stServer = this;

			if (options === undefined || options === null) {
				options = {};
			}

			//--- ~~ --- ~~ --- ~~ --- ~~ ---
			// ST Network

			var Services = require('st.network').get_Services();

			try {
				stServer._init_NodesNetManager({
					"Services": Services
				});
			} catch (e) {
				// TODO: handle exception
				throw "Cannot initialize NodesNetManager" + e;
			}

			try {
				stServer._init_NodesNetService({
					"Services": Services
				});
			} catch (e) {
				// TODO: handle exception
				throw "Cannot initialize NodesNetService" + e;
			}

			try {
				stServer._init_ServerCOMSystem();
			} catch (e) {
				// TODO: handle exception
				throw "Cannot initilize ServerCOMSystem" + e;
			}
		}

		/**
   * Initialize Nodes Net manager
   */

	}, {
		key: '_init_NodesNetManager',
		value: function _init_NodesNetManager(options) {

			var stServer = this;

			if (options === undefined || options === null) {
				options = {};
			}

			if (options.Services === undefined) {
				throw 'Option Services is required.';
			}

			if (stServer.nodesNetManager !== null) {
				throw 'Nodes net manager initialized.';
			}

			var Services = options.Services;

			var NodesNetManager = Services.get_NodesNetManager();

			//--- ~~ --- ~~ --- ~~ --- ~~ ---
			// Nodes net Manager
			stServer.nodesNetManager = new NodesNetManager();
		}

		/**
   * Initialize Nodes Net service
   */

	}, {
		key: '_init_NodesNetService',
		value: function _init_NodesNetService(options) {

			var stServer = this;

			if (options === undefined || options === null) {
				options = {};
			}

			if (stServer.nodesNetService !== null) {
				throw 'Nodes net service initialized.';
			}

			if (options.Services === undefined) {
				throw 'Option Services is required.';
			}

			var Services = options.Services;

			var NodesNetService = Services.get_NodesNetService();

			//--- ~~ --- ~~ --- ~~ --- ~~ ---
			// Nodes net service
			stServer.nodesNetService = new NodesNetService(stServer.nodesManager, stServer.nodesNetManager);
			stServer.nodesNetService.initialize();
		}

		/**
   * Initialize COM system
   */

	}, {
		key: '_init_ServerCOMSystem',
		value: function _init_ServerCOMSystem() {

			var stServer = this;

			if (stServer.comSYS !== undefined && stServer.comSYS !== null) {
				throw 'Server COM System initialized.';
			}

			var COMSystem = require('st.network').get_COMSystem_Lib();

			//--- ~~ --- ~~ --- ~~ --- ~~ ---
			// COM System
			var comSYS_Config = {
				"controlChannel": null,
				"role": "Server",
				"nodesManager": stServer.nodesManager,
				"nodesNetManager": stServer.nodesNetManager,
				"sensorManager": stServer.sensorsManager,
				"actuatorsManager": stServer.actuatorsManager

			};

			stServer.comSYS = COMSystem.getCOMSystem(comSYS_Config);

			try {
				stServer.comSYS.initialize();
			} catch (e) {

				console.log('<EEE> ST Server.init_ServerCOMSystem'); // TODO REMOVE DEBUG LOG
				console.log(' <~~~> ' + e); // TODO REMOVE DEBUG LOG
				stServer._byebye();
			}
		}

		/**
   * Initialize Server Control Service
   * 
   * Is the server for manage messages HTTP/REST
   */

	}, {
		key: 'init_ServerControlService',
		value: function init_ServerControlService() {

			var stServer = this;

			if (stServer.serverControlService !== null) {
				throw 'Server Control Service initialized.';
			}

			//--- ~~ --- ~~ --- ~~ --- ~~ ---
			// Server control Service
			//-------------------------------------------------------------------------------|\/|---

			stServer.serverControlService = new ServerControlService(stServer);

			var scs = stServer.serverControlService;

			scs.eventEmitter.on(scs.CONSTANTS.Events.ServerListening, function (data) {
				console.log('<*> ST Server.serverControlService'); // TODO REMOVE DEBUG LOG
				console.log(' <~~~> Server Listening'); // TODO REMOVE DEBUG LOG
			});

			scs.eventEmitter.on(scs.CONSTANTS.Events.ServerClosed, function (data) {
				console.log('<*> ST Server.serverControlService'); // TODO REMOVE DEBUG LOG
				console.log(' <~~~> Server Closed'); // TODO REMOVE DEBUG LOG
			});

			scs.eventEmitter.on(scs.CONSTANTS.Events.ConfigError, function (data) {
				console.log('<EEE> ST Server.serverControlService'); // TODO REMOVE DEBUG LOG
				console.log(' <~~~> Config Error'); // TODO REMOVE DEBUG LOG
				console.log(data); // TODO REMOVE DEBUG LOG
			});

			try {
				scs.initialize();
				scs.startService();
			} catch (e) {
				// TODO: handle exception
				console.log('<EEE> ST Server.serverControlService'); // TODO REMOVE DEBUG LOG
				console.log(e); // TODO REMOVE DEBUG LOG
			}
			//-------------------------------------------------------------------------------|/\|---
		}

		/**
   * ByeBye method...
   */

	}, {
		key: '_byebye',
		value: function _byebye() {
			var stServer = this;

			console.log('Have a great day!');

			stServer.nodesControlService.stopService();
			stServer.serverControlService.stopService();

			process.exit(0);
		}

		/**
   * Initialize Mini CLI
   */

	}, {
		key: 'init_MiniCLI',
		value: function init_MiniCLI() {

			var stServer = this;

			if (stServer.miniCLI !== undefined && stServer.miniCLI !== null) {
				throw 'Mini CLI initialized.';
			}

			stServer.miniCLI = readline.createInterface(process.stdin, process.stdout);
			stServer.miniCLI.setPrompt('ST.Server> ');

			stServer.miniCLI.prompt();

			stServer.miniCLI.on('line', function (line) {
				var line_ = line.trim();
				switch (line_) {

					case 'nodeslist':
						console.log('>>> NODES List');
						console.log(stServer.nodesManager.nodeList);
						break;

					case 'sensorslist':
						console.log('>>> Sensors List');
						console.log(stServer.sensorsManager.sensorList);
						break;

					case 'actuatorslist':
						console.log('>>> Actuators List');
						console.log(stServer.actuatorsManager.actuatorsList);
						break;

					case 'help':
						var msg = '>>> Help Menu \n';
						msg += 'nodeslist: list of nodes... \n';
						msg += 'sensorslist: list of sensors... \n';
						msg += 'actuatorslist: list of actuatorslist... \n';
						msg += 'help: this help...';

						console.log(msg);
						break;

					default:
						if (line_ !== '') {
							console.log('>???> Say what? I might have heard `' + line_ + '`');
						}
						break;
				}

				stServer.miniCLI.prompt();
			}).on('close', function () {
				stServer._byebye();
			});
		}
	}]);

	return STServer;
}();

module.exports = STServer;
//# sourceMappingURL=ST_Server.js.map
