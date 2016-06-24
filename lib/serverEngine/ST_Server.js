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
let ServerConfiguration = require('./ServerConfiguration.js');

let NodesControlService = require('./NodesControlService.js');
let NodesManager = require('./NodesManager.js');


let ServerControlService = require('./ServerControlService.js');


const readline = require('readline');


/**
 * ST Server
 */
class STServer {
	
	constructor() {
		
		let stServer = this;
		
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
		
		let stServer = this;
		
		if (stServer.serverConfiguration !== null) {
			throw 'Server configuration is loaded.';
		}
		
		// --- ~~ --- ~~ --- ~~ --- ~~ --- 
		// Server configuration 
		// -------------------------------------------------------------------------------|\/|---
		stServer.serverConfiguration = new ServerConfiguration();

		stServer.serverConfiguration.readFile();

		if (stServer.serverConfiguration.config === null) {
			
			console.log('Error in configuration');	// TODO REMOVE DEBUG LOG
			
			process.exit(0);
//			return -1;
			
		}
		console.log('<*> ST Server');	// TODO REMOVE DEBUG LOG
		console.log(' <~~~> ServerConfiguration');	// TODO REMOVE DEBUG LOG
		console.log(stServer.serverConfiguration.config);	// TODO REMOVE DEBUG LOG

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
	 */
	init_STNetwork(options) {
		
		let stServer = this;
		
		if (options === undefined || 
				options === null) {
			options = {};
		}
		
		//--- ~~ --- ~~ --- ~~ --- ~~ --- 
		// ST Network 
		
		let Services = require('st.network').get_Services();
		
		
		try {
			stServer._init_NodesNetManager({
				"Services" : Services
			});
		} catch (e) {
			// TODO: handle exception
			throw "Cannot initialize NodesNetManager" + e;
		}
		
		
		try {
			stServer._init_NodesNetService({
				"Services" : Services
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
	_init_NodesNetManager(options) {
		
		let stServer = this;
		
		
		if (options === undefined || 
				options === null) {
			options = {};
		}
		
		if (options.Services === undefined) {
			throw 'Option Services is required.';
		}
		
		
		if (stServer.nodesNetManager !== null) {
			throw 'Nodes net manager initialized.';
		}
		
		
		let Services = options.Services;
		
		let NodesNetManager = Services.get_NodesNetManager();
		
		//--- ~~ --- ~~ --- ~~ --- ~~ --- 
		// Nodes net Manager 
		stServer.nodesNetManager = new NodesNetManager();
		
	}
	
	
	/**
	 * Initialize Nodes Net service
	 */
	_init_NodesNetService(options) {
		
		let stServer = this;
		
		if (options === undefined || 
				options === null) {
			options = {};
		}
		
		if (stServer.nodesNetService !== null) {
			throw 'Nodes net service initialized.';
		}
		
		if (options.Services === undefined) {
			throw 'Option Services is required.';
		}
				
		
		let Services = options.Services;
		
		let NodesNetService = Services.get_NodesNetService();
		
		//--- ~~ --- ~~ --- ~~ --- ~~ --- 
		// Nodes net service 
		stServer.nodesNetService = new NodesNetService(stServer.nodesManager, stServer.nodesNetManager);
		stServer.nodesNetService.initialize();
		
	}
	
	
	/**
	 * Initialize COM system
	 */
	_init_ServerCOMSystem() {
		
		let stServer = this;
			
		if (stServer.comSYS !== undefined &&
				stServer.comSYS !== null) {
			throw 'Server COM System initialized.';
		}
		
		let COMSystem = require('st.network').get_COMSystem_Lib();
		
		//--- ~~ --- ~~ --- ~~ --- ~~ --- 
		// COM System 
		let comSYS_Config = {
			"controlChannel" : null,
			"role" : "Server",
			"nodesManager" : stServer.nodesManager,
			"nodesNetManager" : stServer.nodesNetManager,
			"sensorManager" : stServer.sensorsManager,
			"actuatorsManager" : stServer.actuatorsManager

		};
		
		stServer.comSYS = COMSystem.getCOMSystem(comSYS_Config);
		
		try {
			stServer.comSYS.initialize();
		} catch (e) {
			
			console.log('<EEE> ST Server.init_ServerCOMSystem');	// TODO REMOVE DEBUG LOG
			console.log(' <~~~> ' + e);	// TODO REMOVE DEBUG LOG
			stServer._byebye();
		}
		
	}
	
	
	/**
	 * Initialize Server Control Service
	 * 
	 * Is the server for manage messages HTTP/REST
	 */
	init_ServerControlService() {
		
		let stServer = this;
		
		if (stServer.serverControlService !== null) {
			throw 'Server Control Service initialized.';
		}
		
		
		//--- ~~ --- ~~ --- ~~ --- ~~ --- 
		// Server control Service 
		//-------------------------------------------------------------------------------|\/|---

		stServer.serverControlService = new ServerControlService( stServer );
		
		let scs = stServer.serverControlService;

		scs.eventEmitter.on(scs.CONSTANTS.Events.ServerListening, function(data){
			console.log('<*> ST Server.serverControlService');	// TODO REMOVE DEBUG LOG
			console.log(' <~~~> Server Listening');	// TODO REMOVE DEBUG LOG

		});

		scs.eventEmitter.on(scs.CONSTANTS.Events.ServerClosed, function(data){
			console.log('<*> ST Server.serverControlService');	// TODO REMOVE DEBUG LOG
			console.log(' <~~~> Server Closed');	// TODO REMOVE DEBUG LOG

		});
		
		scs.eventEmitter.on(scs.CONSTANTS.Events.ConfigError, function(data){
			console.log('<EEE> ST Server.serverControlService');	// TODO REMOVE DEBUG LOG
			console.log(' <~~~> Config Error');	// TODO REMOVE DEBUG LOG
			console.log(data);	// TODO REMOVE DEBUG LOG

		});

		try {
			scs.initialize();
			scs.startService();
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
		        console.log( stServer.sensorsManager.sensorList);
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
