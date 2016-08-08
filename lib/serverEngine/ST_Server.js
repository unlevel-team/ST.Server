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


/**
 * import ServerConfiguration
 * @ignore
 */
let ServerConfiguration = require('./ServerConfiguration.js');

/**
 * import NodesControlService
 * @ignore
 */
let NodesControlService = require('./NodesControlService.js');

/**
 * import NodesManager
 * @ignore
 */
let NodesManager = require('./NodesManager.js');

/**
 * import ServerControlService
 * @ignore
 */
let ServerControlService = require('./ServerControlService.js');


/**
 * import readline
 * @ignore
 */
const readline = require('readline');


/**
 * ST Server
 * 
 * @class
 * @memberof st.serverEngine
 * 
 * @property {object} serverConfiguration - Server configuration object
 * 
 * @property {EnginesSystem} ngSYS - Engines System
 * @property {SensorsManager} sensorsManager - Sensors manager
 * @property {ActuatorsManager} actuatorsManager - Actuators manager
 * 
 * @property {NodesManager} nodesManager - Nodes manager
 * @property {NodesControlService} nodesControlService - Nodes Control service
 * 
 * @property {NodesNetManager} nodesNetManager - Nodes Net manager
 * @property {NodesNetService} nodesNetService - Nodes Net service
 * 
 * @property {ServerControlService} serverControlService - Nodes Net service
 * 
 * @property {object} miniCLI - mini CLI
 * 
 */
class STServer {
	
	/**
	 * 
	 * @constructs STServer
	 * 
	 * @param {object} options - Options object
	 * 
	 */
	constructor(options) {
		
		if (options === undefined) {
			options = {};
		}
		
		let _stServer = this;
		_stServer._config = {};
		
		if (options.config !== undefined) {
			_stServer._config = options.config;
		}
		
		_stServer.serverConfiguration = null;
		
		
		_stServer.ngSYS = null;
		_stServer.sensorsManager = null;
		_stServer.actuatorsManager = null;
		
		_stServer.nodesManager = null;
		_stServer.nodesControlService = null;
		
		_stServer.nodesNetManager = null;
		_stServer.nodesNetService = null;
		
		_stServer.serverNetManager = null;
		
		_stServer.serverControlService = null;
		
		_stServer.miniCLI = null;
	
	}
	
	
	/**
	 * Initialize ST Server
	 */
	init_Server() {
		
		let stServer = this;
		
		stServer.loadConfig();
		
		
//		stServer._init_EnginesSystem__OLD();
		
		
		
		stServer._init_NodesManager();
		stServer._init_NodesControlService();
		
		stServer._init_EnginesSystem();
		
	}
	
	
	/**
	 * Load configuration
	 */
	loadConfig() {
		
		let _stServer = this;
		let _config = _stServer._config;
		
		if (_stServer.serverConfiguration !== null) {
			throw 'Server configuration is loaded.';
		}
		
		// --- ~~ --- ~~ --- ~~ --- ~~ --- 
		// Server configuration 
		// -------------------------------------------------------------------------------|\/|---
		_stServer.serverConfiguration = new ServerConfiguration();

		_stServer.serverConfiguration.readFile({
			'configFile': _config.configfile
		});

		if (_stServer.serverConfiguration.config === null) {
			
			console.log('Error in configuration');	// TODO REMOVE DEBUG LOG
			
			process.exit(0);
//			return -1;
			
		}
		console.log('<*> ST Server');	// TODO REMOVE DEBUG LOG
		console.log(' <~~~> ServerConfiguration');	// TODO REMOVE DEBUG LOG
		console.log(_stServer.serverConfiguration.config);	// TODO REMOVE DEBUG LOG

		//-------------------------------------------------------------------------------|/\|---
		
	}
	
	
	/**
	 * Initialize Nodes manager
	 */
	_init_NodesManager() {
		
		let stServer = this;
		
		if (stServer.nodesManager !== null) {
			throw 'Nodes manager initialized.';
		}
		
		
		//--- ~~ --- ~~ --- ~~ --- ~~ --- 
		// Nodes Manager 
		//-------------------------------------------------------------------------------|\/|---
		stServer.nodesManager = new NodesManager();
		let nmgr = stServer.nodesManager;

		// Map event NodeAdded
		nmgr.eventEmitter.on(nmgr.CONSTANTS.Events.NodeAdded, function(data){
			console.log('<*> ST Server.nodesManager');	// TODO REMOVE DEBUG LOG
			console.log(' <~~~> Events.NodeAdded');	// TODO REMOVE DEBUG LOG
		
//			stServer.sensorsManager.addSensorsFromNode( data.node );	// bind Node to Sensors manager
//			stServer.actuatorsManager.addActuatorsFromNode( data.node );	// bind Node to Actuators manager

		});

		// Map event NodeRemoved
		nmgr.eventEmitter.on(nmgr.CONSTANTS.Events.NodeRemoved, function(data){
			console.log('<*> ST Server.nodesManager');	// TODO REMOVE DEBUG LOG
			console.log(' <~~~> Events.NodeRemoved');	// TODO REMOVE DEBUG LOG

		});
		//-------------------------------------------------------------------------------|/\|---
		
	}
	
	
	/**
	 * Initialize engines system
	 * 
	 * @throws Exception
	 * 
	 */
	_init_EnginesSystem() {
		
		let stServer = this;
		
		if (stServer.ngSYS !== null) {
			throw 'Engines System initialized.';
		}
		
		let STEngines = require('st.engines');
		
		
		//--- ~~ --- ~~ --- ~~ --- ~~ --- 
		// Engines System 
		//
		// Set role Server & control channel
		let ngSYSconfig = {
				
			"role" : "Server",
			"controlChannel" : stServer.nodesControlService,
			
			"nodesManager" : stServer.nodesManager
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
	 * <pre>
	 * Service for control Nodes
	 * </pre>
	 */
	_init_NodesControlService() {
		
		let stServer = this;
		
		if (stServer.nodesControlService !== null) {
			throw 'Nodes Control Service initialized.';
		}
		
		
		let config = stServer.serverConfiguration.config;
		
		
		//--- ~~ --- ~~ --- ~~ --- ~~ --- 
		// Nodes control Service 
		//-------------------------------------------------------------------------------|\/|---

		stServer.nodesControlService = new NodesControlService( config );

		let ncsrv = stServer.nodesControlService;
		
		ncsrv.eventEmitter.on(ncsrv.CONSTANTS.Events.ConfigError, function(data){
			console.log('EEE> ST Server.ConfigError');	// TODO REMOVE DEBUG LOG
			console.log(' <~~~> Configuration error.');	// TODO REMOVE DEBUG LOG
			stServer._byebye();
		});

		ncsrv.eventEmitter.on(ncsrv.CONSTANTS.Events.ServerListening, function(data){
			console.log('<*> ST Server.nodesControlService');	// TODO REMOVE DEBUG LOG
			console.log(' <~~~> Server Listening');	// TODO REMOVE DEBUG LOG

		});

		ncsrv.eventEmitter.on(ncsrv.CONSTANTS.Events.ServerClosed, function(data){
			console.log('<*> ST Server.nodesControlService');	// TODO REMOVE DEBUG LOG
			console.log(' <~~~> Server Closed');	// TODO REMOVE DEBUG LOG

		});

		ncsrv.eventEmitter.on(ncsrv.CONSTANTS.Events.NodeConnected, function(data){
			console.log('<*> ST Server.nodesControlService');	// TODO REMOVE DEBUG LOG
			console.log(' <~~~> Events.NodeConnected');	// TODO REMOVE DEBUG LOG
			
			stServer.nodesManager.addNode(null, data.socket);
		});

		ncsrv.eventEmitter.on(ncsrv.CONSTANTS.Events.NodeDisconnected, function(data){
			console.log('<*> ST Server.nodesControlService');	// TODO REMOVE DEBUG LOG
			console.log(' <~~~> Events.NodeDisconnected');	// TODO REMOVE DEBUG LOG
		});

		try {
			ncsrv.startService();

		} catch (e) {
			// TODO: handle exception
			console.log('Cannot start the service');	// TODO REMOVE DEBUG LOG

		}
		//-------------------------------------------------------------------------------|/\|---
		
	}
	
	
	/**
	 * Initialize ST Network
	 * <pre>
	 * Initializes all managers and services related to ST Network.
	 * </pre>
	 */
	init_STNetwork(options) {
		
		let _stServer = this;
		
		if (options === undefined || 
				options === null) {
			options = {};
		}
		
		//--- ~~ --- ~~ --- ~~ --- ~~ --- 
		// ST Network 
		
		let _services = require('st.network').get_Services();
		
		
		try {
			_stServer._init_NodesNetManager({
				"Services" : _services
			});
		} catch (e) {
			// TODO: handle exception
			throw "Cannot initialize NodesNetManager" + e;
		}
		
		
		try {
			_stServer._init_NodesNetService({
				"Services" : _services
			});
		} catch (e) {
			// TODO: handle exception
			throw "Cannot initialize NodesNetService" + e;
		}

		
		try {
			_stServer._init_ServerCOMSystem();
		} catch (e) {
			// TODO: handle exception
			throw "Cannot initilize ServerCOMSystem" + e;
		}
		
	}
	
	
	/**
	 * Initialize Nodes Net manager
	 * <pre>
	 * Initializes the Net manager for nodes
	 * </pre>
	 */
	_init_NodesNetManager(options) {
		
		let _stServer = this;
		
		
		if (options === undefined || 
				options === null) {
			options = {};
		}
		
		if (options.Services === undefined) {
			throw 'Option Services is required.';
		}
		let _services = options.Services;

		
		if (_stServer.nodesNetManager !== null) {
			throw 'Nodes net manager initialized.';
		}
		
		
		let NodesNetManager = _services.get_NodesNetManager();
		
		//--- ~~ --- ~~ --- ~~ --- ~~ --- 
		// Nodes net Manager 
		_stServer.nodesNetManager = new NodesNetManager();
		
	}
	
	
	/**
	 * Initialize Nodes Net service
	 * <pre>
	 * Initializes the Net services for nodes
	 * </pre>
	 */
	_init_NodesNetService(options) {
		
		let _stServer = this;
		
		if (options === undefined || 
				options === null) {
			options = {};
		}
		
		if (_stServer.nodesNetService !== null) {
			throw 'Nodes net service initialized.';
		}
		
		if (options.Services === undefined) {
			throw 'Option Services is required.';
		}
				
		
		let _services = options.Services;
		
		let NodesNetService = _services.get_NodesNetService();
		
		//--- ~~ --- ~~ --- ~~ --- ~~ --- 
		// Nodes net service 
		_stServer.nodesNetService = new NodesNetService(_stServer.nodesManager, _stServer.nodesNetManager);
		_stServer.nodesNetService.initialize();
		
	}
	
	
	/**
	 * Initialize COM system
	 */
	_init_ServerCOMSystem() {
		
		let _stServer = this;
			
		if (_stServer.comSYS !== undefined &&
				_stServer.comSYS !== null) {
			throw 'Server COM System initialized.';
		}
		
		let _COMSystem = require('st.network').get_COMSystem_Lib();
		
		//--- ~~ --- ~~ --- ~~ --- ~~ --- 
		// COM System 
		let _comSYS_Config = {
			"controlChannel" : null,
			"role" : "Server"
		};
		
		_stServer.comSYS = _COMSystem.getCOMSystem( _comSYS_Config );
		
		try {
			_stServer.comSYS.initialize();
		} catch (e) {
			
			console.log('<EEE> ST Server.init_ServerCOMSystem');	// TODO REMOVE DEBUG LOG
			console.log(' <~~~> ' + e);	// TODO REMOVE DEBUG LOG
			_stServer._byebye();
		}
		
	}
	
	
	/**
	 * Initialize Server Control Service
	 * 
	 * Is the server for manage messages HTTP/REST
	 */
	init_ServerControlService() {
		
		let _stServer = this;
		
		if (_stServer.serverControlService !== null) {
			throw 'Server Control Service initialized.';
		}
		
		
		//--- ~~ --- ~~ --- ~~ --- ~~ --- 
		// Server control Service 
		//-------------------------------------------------------------------------------|\/|---

		_stServer.serverControlService = new ServerControlService( _stServer );
		
		let _scs = _stServer.serverControlService;

		_scs.eventEmitter.on(_scs.CONSTANTS.Events.ServerListening, function(data){
			console.log('<*> ST Server.serverControlService');	// TODO REMOVE DEBUG LOG
			console.log(' <~~~> Server Listening');	// TODO REMOVE DEBUG LOG

		});

		_scs.eventEmitter.on(_scs.CONSTANTS.Events.ServerClosed, function(data){
			console.log('<*> ST Server.serverControlService');	// TODO REMOVE DEBUG LOG
			console.log(' <~~~> Server Closed');	// TODO REMOVE DEBUG LOG

		});
		
		_scs.eventEmitter.on(_scs.CONSTANTS.Events.ConfigError, function(data){
			console.log('<EEE> ST Server.serverControlService');	// TODO REMOVE DEBUG LOG
			console.log(' <~~~> Config Error');	// TODO REMOVE DEBUG LOG
			console.log(data);	// TODO REMOVE DEBUG LOG

		});

		try {
			_scs.initialize();
			_scs.startService();
		} catch (e) {
			// TODO: handle exception
			console.log('<EEE> ST Server.serverControlService');	// TODO REMOVE DEBUG LOG
			console.log(e);	// TODO REMOVE DEBUG LOG
			
		}
		//-------------------------------------------------------------------------------|/\|---
		
	}
	
	
	/**
	 * ByeBye method...
	 */
	_byebye() {
		
		let stServer = this;
		
		console.log('Have a great day!');
		  
		stServer.nodesControlService.stopService();
		stServer.serverControlService.stopService();

		process.exit(0);
	}
	
	
	/**
	 * Initialize Mini CLI
	 */
	init_MiniCLI() {

		let stServer = this;
		
		if (stServer.miniCLI !== undefined &&
				stServer.miniCLI !== null) {
			throw 'Mini CLI initialized.';
		}
		
		stServer.miniCLI = readline.createInterface(process.stdin, process.stdout);
		stServer.miniCLI.setPrompt('ST.Server> ');

		stServer.miniCLI.prompt();

		stServer.miniCLI.on('line', function(line) {
			var line_ = line.trim();
		  switch(line_) {
		      
		    case 'nodeslist':
		        console.log('>>> NODES List');
		        console.log( stServer.nodesManager.nodeList);
		        break;
		        
		    case 'sensorslist':
		        console.log('>>> Sensors List');
		        console.log( stServer.sensorsManager.sensorsList);
		        break;
		        
		    case 'actuatorslist':
		        console.log('>>> Actuators List');
		        console.log( stServer.actuatorsManager.actuatorsList);
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
		  
		}).on('close', function() {
			stServer._byebye();
		});

	}
	
}


module.exports = STServer;
