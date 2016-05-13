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
let SensorsManager = require('./SensorsManager.js');
let ActuatorsManager = require('./ActuatorsManager.js');

let NodesNetManager = require('./NodesNetManager.js');
let NodesNetService = require('./NodesNetService.js').NodesNetService;


let ServerControlService = require('./ServerControlService.js');


const readline = require('readline');

/**
 * ST Server
 */
class STServer {
	
	
	constructor() {
		this.serverConfiguration = null;
		
		this.sensorsManager = null;
		this.actuatorsManager = null;
		this.nodesManager = null;
		
		this.nodesControlService = null;
		
		this.nodesNetManager = null;
		this.nodesNetService = null;
		
		this.serverControlService = null;
		
		this.miniCLI = null;
	}
	
	
	/**
	 * Initialize ST Server
	 */
	init_Server() {
		
		let stServer = this;
		
		stServer.loadConfig();
		
		//--- ¨¨ --- ¨¨ --- ¨¨ --- ¨¨ --- 
		// Sensors Manager 
		stServer.sensorsManager = new SensorsManager();

		//--- ¨¨ --- ¨¨ --- ¨¨ --- ¨¨ --- 
		// Actuators Manager 
		stServer.actuatorsManager = new ActuatorsManager();
		
		stServer.init_NodesManager();
		
	}
	
	
	/**
	 * Load configuration
	 */
	loadConfig() {
		
		let stServer = this;
		
		if (stServer.serverConfiguration != null) {
			throw 'Server configuration is loaded.';
		}
		
		// --- ¨¨ --- ¨¨ --- ¨¨ --- ¨¨ --- 
		// Server configuration 
		// -------------------------------------------------------------------------------|\/|---
		stServer.serverConfiguration = new ServerConfiguration();

		stServer.serverConfiguration.readFile();

		if (stServer.serverConfiguration.config == null) {
			
			console.log('Error in configuration');	// TODO REMOVE DEBUG LOG
			
			process.exit(0);
//			return -1;
			
		}
		console.log('<···> ST Server');	// TODO REMOVE DEBUG LOG
		console.log(' <···> ServerConfiguration');	// TODO REMOVE DEBUG LOG
		console.log(stServer.serverConfiguration.config);	// TODO REMOVE DEBUG LOG

		//-------------------------------------------------------------------------------|/\|---
		
	}
	
	
	/**
	 * Initialize Nodes manager
	 */
	init_NodesManager() {
		
		let stServer = this;
		
		if (stServer.nodesManager != null) {
			throw 'Nodes manager initialized.';
		}
		
		
		
		//--- ¨¨ --- ¨¨ --- ¨¨ --- ¨¨ --- 
		// Nodes Manager 
		//-------------------------------------------------------------------------------|\/|---
		stServer.nodesManager = new NodesManager();


		stServer.nodesManager.eventEmitter.on(stServer.nodesManager.CONSTANTS.Events.NodeAdded, function(data){
			console.log('<···> ST Server.nodesManager');	// TODO REMOVE DEBUG LOG
			console.log(' <···> Events.NodeAdded');	// TODO REMOVE DEBUG LOG
			
			stServer.sensorsManager.addSensorsFromNode( data.node );	// bind Node to Sensors manager
			stServer.actuatorsManager.addActuatorsFromNode( data.node );	// bind Node to Actuators manager

		});

		stServer.nodesManager.eventEmitter.on(stServer.nodesManager.CONSTANTS.Events.NodeRemoved, function(data){
			console.log('<···> ST Server.nodesManager');	// TODO REMOVE DEBUG LOG
			console.log(' <···> Events.NodeRemoved');	// TODO REMOVE DEBUG LOG

		});
		//-------------------------------------------------------------------------------|/\|---
		
	}
	
	/**
	 * Initialize Nodes Control Service
	 */
	init_NodesControlService() {
		
		let stServer = this;
		
		if (stServer.nodesControlService != null) {
			throw 'Nodes Control Service initialized.';
		}
		
		
		//--- ¨¨ --- ¨¨ --- ¨¨ --- ¨¨ --- 
		// Nodes control Service 
		//-------------------------------------------------------------------------------|\/|---

		stServer.nodesControlService = new NodesControlService( stServer.serverConfiguration.config );

		
		stServer.nodesControlService.eventEmitter.on(stServer.nodesControlService.CONSTANTS.Events.ConfigError, function(data){
			console.log('EEE> ST Server.ConfigError');	// TODO REMOVE DEBUG LOG
			console.log(' <···> Configuration error.');	// TODO REMOVE DEBUG LOG
			stServer._byebye();
		});

		stServer.nodesControlService.eventEmitter.on(stServer.nodesControlService.CONSTANTS.Events.ServerListening, function(data){
			console.log('<···> ST Server.nodesControlService');	// TODO REMOVE DEBUG LOG
			console.log(' <···> Server Listening');	// TODO REMOVE DEBUG LOG

		});

		stServer.nodesControlService.eventEmitter.on(stServer.nodesControlService.CONSTANTS.Events.ServerClosed, function(data){
			console.log('<···> ST Server.nodesControlService');	// TODO REMOVE DEBUG LOG
			console.log(' <···> Server Closed');	// TODO REMOVE DEBUG LOG

		});

		stServer.nodesControlService.eventEmitter.on(stServer.nodesControlService.CONSTANTS.Events.NodeConnected, function(data){
			console.log('<···> ST Server.nodesControlService');	// TODO REMOVE DEBUG LOG
			console.log(' <···> Events.NodeConnected');	// TODO REMOVE DEBUG LOG
			
			stServer.nodesManager.addNode(null, data.socket);
		});

		stServer.nodesControlService.eventEmitter.on(stServer.nodesControlService.CONSTANTS.Events.NodeDisconnected, function(data){
			console.log('<···> ST Server.nodesControlService');	// TODO REMOVE DEBUG LOG
			console.log(' <···> Events.NodeDisconnected');	// TODO REMOVE DEBUG LOG
		});

		try {
			stServer.nodesControlService.startService();

		} catch (e) {
			// TODO: handle exception
			console.log('Cannot start the service');	// TODO REMOVE DEBUG LOG

		}
		//-------------------------------------------------------------------------------|/\|---
		
	}
	
	
	/**
	 * Initialize Nodes Net manager
	 */
	init_NodesNetManager() {
		
		let stServer = this;
		
		if (stServer.nodesNetManager != null) {
			throw 'Nodes net manager initialized.';
		}
		
		
		//--- ¨¨ --- ¨¨ --- ¨¨ --- ¨¨ --- 
		// Nodes net Manager 
		stServer.nodesNetManager = new NodesNetManager();
		
	}
	
	
	/**
	 * Initialize Nodes Net service
	 */
	init_NodesNetService() {
		
		let stServer = this;
		
		if (stServer.nodesNetService != null) {
			throw 'Nodes net service initialized.';
		}
		
		
		//--- ¨¨ --- ¨¨ --- ¨¨ --- ¨¨ --- 
		// Nodes net service 
		stServer.nodesNetService = new NodesNetService(stServer.nodesManager, stServer.nodesNetManager);
		stServer.nodesNetService.initialize();
		
	}
	
	
	/**
	 * Initialize Server Control Service
	 */
	init_ServerControlService() {
		
		let stServer = this;
		
		if (stServer.serverControlService != null) {
			throw 'Server Control Service initialized.';
		}
		
		
		//--- ¨¨ --- ¨¨ --- ¨¨ --- ¨¨ --- 
		// Server control Service 
		//-------------------------------------------------------------------------------|\/|---

		stServer.serverControlService = new ServerControlService( this );

		stServer.serverControlService.eventEmitter.on(stServer.serverControlService.CONSTANTS.Events.ServerListening, function(data){
			console.log('<···> ST Server.serverControlService');	// TODO REMOVE DEBUG LOG
			console.log(' <···> Server Listening');	// TODO REMOVE DEBUG LOG

		});

		stServer.serverControlService.eventEmitter.on(stServer.serverControlService.CONSTANTS.Events.ServerClosed, function(data){
			console.log('<···> ST Server.serverControlService');	// TODO REMOVE DEBUG LOG
			console.log(' <···> Server Closed');	// TODO REMOVE DEBUG LOG

		});
		
		stServer.serverControlService.eventEmitter.on(stServer.serverControlService.CONSTANTS.Events.ConfigError, function(data){
			console.log('<EEE> ST Server.serverControlService');	// TODO REMOVE DEBUG LOG
			console.log(' <···> Config Error');	// TODO REMOVE DEBUG LOG

		});

		try {
			stServer.serverControlService.startService();
		} catch (e) {
			// TODO: handle exception
			console.log('<EEE> ST Server.serverControlService');	// TODO REMOVE DEBUG LOG
			console.log(' <···> ' + e.message);	// TODO REMOVE DEBUG LOG
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
		
		if (stServer.miniCLI != null) {
			throw 'Mini CLI initialized.';
		}
		
		stServer.miniCLI = readline.createInterface(process.stdin, process.stdout);
		stServer.miniCLI.setPrompt('STServer> ');
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
		    	if (line_ != '') {
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
