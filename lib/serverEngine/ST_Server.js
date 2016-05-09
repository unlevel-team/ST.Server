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
		
		this.loadConfig();
		
		//--- ¨¨ --- ¨¨ --- ¨¨ --- ¨¨ --- 
		// Sensors Manager 
		this.sensorsManager = new SensorsManager();

		//--- ¨¨ --- ¨¨ --- ¨¨ --- ¨¨ --- 
		// Actuators Manager 
		this.actuatorsManager = new ActuatorsManager();
		
		this.init_NodesManager();
		
	}
	
	
	/**
	 * Load configuration
	 */
	loadConfig() {
		
		if (this.serverConfiguration != null) {
			throw 'Server configuration is loaded.';
		}
		
		
		
		// --- ¨¨ --- ¨¨ --- ¨¨ --- ¨¨ --- 
		// Server configuration 
		// -------------------------------------------------------------------------------|\/|---
		this.serverConfiguration = new ServerConfiguration();


		this.serverConfiguration.readFile();

		if (this.serverConfiguration.config == null) {
			
			console.log('Error in configuration');	// TODO REMOVE DEBUG LOG
			
			process.exit(0);
//			return -1;
			
		}
		console.log('<···> ST Server');	// TODO REMOVE DEBUG LOG
		console.log(' <···> ServerConfiguration');	// TODO REMOVE DEBUG LOG
		console.log(this.serverConfiguration.config);	// TODO REMOVE DEBUG LOG

		//-------------------------------------------------------------------------------|/\|---
		
	}
	
	/**
	 * Initialize Nodes manager
	 */
	init_NodesManager() {
		
		if (this.nodesManager != null) {
			throw 'Nodes manager initialized.';
		}
		
		let stServer = this;
		
		//--- ¨¨ --- ¨¨ --- ¨¨ --- ¨¨ --- 
		// Nodes Manager 
		//-------------------------------------------------------------------------------|\/|---
		this.nodesManager = new NodesManager();


		this.nodesManager.eventEmitter.on(this.nodesManager.CONSTANTS.Events.NodeAdded, function(data){
			console.log('<···> ST Server.nodesManager');	// TODO REMOVE DEBUG LOG
			console.log(' <···> Events.NodeAdded');	// TODO REMOVE DEBUG LOG
			
			stServer.sensorsManager.addSensorsFromNode( data.node );	// bind Node to Sensors manager
			stServer.actuatorsManager.addActuatorsFromNode( data.node );	// bind Node to Actuators manager

		});

		this.nodesManager.eventEmitter.on(this.nodesManager.CONSTANTS.Events.NodeRemoved, function(data){
			console.log('<···> ST Server.nodesManager');	// TODO REMOVE DEBUG LOG
			console.log(' <···> Events.NodeRemoved');	// TODO REMOVE DEBUG LOG

		});
		//-------------------------------------------------------------------------------|/\|---
		
	}
	
	/**
	 * Initialize Nodes Control Service
	 */
	init_NodesControlService() {
		
		if (this.nodesControlService != null) {
			throw 'Nodes Control Service initialized.';
		}
		
		let stServer = this;
		
		//--- ¨¨ --- ¨¨ --- ¨¨ --- ¨¨ --- 
		// Nodes control Service 
		//-------------------------------------------------------------------------------|\/|---

		this.nodesControlService = new NodesControlService( this.serverConfiguration.config );

		
		this.nodesControlService.eventEmitter.on(this.nodesControlService.CONSTANTS.Events.ConfigError, function(data){
			console.log('EEE> ST Server.ConfigError');	// TODO REMOVE DEBUG LOG
			console.log(' <···> Configuration error.');	// TODO REMOVE DEBUG LOG
			stServer._byebye();
		});

		this.nodesControlService.eventEmitter.on(this.nodesControlService.CONSTANTS.Events.ServerListening, function(data){
			console.log('<···> ST Server.nodesControlService');	// TODO REMOVE DEBUG LOG
			console.log(' <···> Server Listening');	// TODO REMOVE DEBUG LOG

		});

		this.nodesControlService.eventEmitter.on(this.nodesControlService.CONSTANTS.Events.ServerClosed, function(data){
			console.log('<···> ST Server.nodesControlService');	// TODO REMOVE DEBUG LOG
			console.log(' <···> Server Closed');	// TODO REMOVE DEBUG LOG

		});

		this.nodesControlService.eventEmitter.on(this.nodesControlService.CONSTANTS.Events.NodeConnected, function(data){
			console.log('<···> ST Server.nodesControlService');	// TODO REMOVE DEBUG LOG
			console.log(' <···> Events.NodeConnected');	// TODO REMOVE DEBUG LOG
			
			stServer.nodesManager.addNode(null, data.socket);
		});

		this.nodesControlService.eventEmitter.on(this.nodesControlService.CONSTANTS.Events.NodeDisconnected, function(data){
			console.log('<···> ST Server.nodesControlService');	// TODO REMOVE DEBUG LOG
			console.log(' <···> Events.NodeDisconnected');	// TODO REMOVE DEBUG LOG
		});

		try {
			this.nodesControlService.startService();

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
		
		if (this.nodesNetManager != null) {
			throw 'Nodes net manager initialized.';
		}
		
		
		//--- ¨¨ --- ¨¨ --- ¨¨ --- ¨¨ --- 
		// Nodes net Manager 
		this.nodesNetManager = new NodesNetManager();
		
	}
	
	
	/**
	 * Initialize Nodes Net service
	 */
	init_NodesNetService() {
		
		if (this.nodesNetService != null) {
			throw 'Nodes net service initialized.';
		}
		
		let stServer = this;
		
		//--- ¨¨ --- ¨¨ --- ¨¨ --- ¨¨ --- 
		// Nodes net service 
		this.nodesNetService = new NodesNetService(stServer.nodesManager, stServer.nodesNetManager);
		this.nodesNetService.initialize();
		
	}
	
	
	/**
	 * Initialize Server Control Service
	 */
	init_ServerControlService() {
		
		if (this.serverControlService != null) {
			throw 'Server Control Service initialized.';
		}
		
		let stServer = this;
		
		//--- ¨¨ --- ¨¨ --- ¨¨ --- ¨¨ --- 
		// Server control Service 
		//-------------------------------------------------------------------------------|\/|---

		this.serverControlService = new ServerControlService( this );


		this.serverControlService.eventEmitter.on(this.serverControlService.CONSTANTS.Events.ServerListening, function(data){
			console.log('<···> ST Server.serverControlService');	// TODO REMOVE DEBUG LOG
			console.log(' <···> Server Listening');	// TODO REMOVE DEBUG LOG

		});

		this.serverControlService.eventEmitter.on(this.serverControlService.CONSTANTS.Events.ServerClosed, function(data){
			console.log('<···> ST Server.serverControlService');	// TODO REMOVE DEBUG LOG
			console.log(' <···> Server Closed');	// TODO REMOVE DEBUG LOG

		});
		
		this.serverControlService.eventEmitter.on(this.serverControlService.CONSTANTS.Events.ConfigError, function(data){
			console.log('<EEE> ST Server.serverControlService');	// TODO REMOVE DEBUG LOG
			console.log(' <···> Config Error');	// TODO REMOVE DEBUG LOG

		});

		try {
			this.serverControlService.startService();
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
		
		if (this.miniCLI != null) {
			throw 'Mini CLI initialized.';
		}
		
		let stServer = this;
		
		this.miniCLI = readline.createInterface(process.stdin, process.stdout);
		this.miniCLI.setPrompt('STServer> ');
		this.miniCLI.prompt();

		this.miniCLI.on('line', function(line) {
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
