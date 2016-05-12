"use strict";

/*
 Actuators manager
 
 - Manages actuators
 - Adds actuators from node
 - Get actuator by id
 - Get actuators by node
 - Start/Stop actuator
 - Turn off actuators of node
 
 */


let EventEmitter = require('events').EventEmitter;



/**
 * ActuatorsManager CONSTANTS
 */
const ActuatorsManager_CONSTANTS = {
		"Config" : {
			"type_Vactuator" : "vactuator",
			"type_Cylonjs" : "cylonjs"

		},
		
		"States" : {
			"State_Config" : "config",
			"State_Ready" : "ready",
			"State_Working" : "working",
			"State_Stop" : "stop"
		},
		
		
		"Events" : {
			"ActuatorRemoved" : "Actuator Removed",
			
			"StartActuator" : "StartActuator",
			"ActuatorStarted" : "ActuatorStarted",
			"StopActuator" : "StopActuator",
			"ActuatorStopped" : "ActuatorStopped",
		},
		
		"Messages" : {
			"getActuatorsList" : "Get Actuators List",
			"ActuatorsList" : "Actuators List",
			"getActuatorInfo" : "Get Actuator Info",
			"ActuatorInfo" : "Actuator Info",
			"getActuatorOptions" : "Get Actuator Options",
			"setActuatorOptions" : "Set Actuator Options",
			"ActuatorOptions" : "Actuator Options",
			"ActuatorOptionsUpdated" : "Actuator Options Updated",
			
			"StartActuator" : "StartActuator",
			"ActuatorStarted" : "ActuatorStarted",
			"StopActuator" : "StopActuator",
			"ActuatorStopped" : "ActuatorStopped",
			
			
			"TurnOffActuators" : "TurnOffActuators"
		}
	};



/**
 * Actuator
 */
class Actuator {
	
	constructor(config) {
		this.config = config;
		this.eventEmitter = new EventEmitter();
		
		this.CONSTANTS = ActuatorsManager_CONSTANTS;
		this.state = ActuatorsManager_CONSTANTS.States.State_Config;
		
	}
	
	/**
	 * Initialize
	 */
	initialize() {
		
		this.mapControlMessages();
		this.state = ActuatorsManager_CONSTANTS.States.State_Ready;
	}
	
	
	/**
	 * Map control messages
	 */
	mapControlMessages() {
		
		let stActuator = this;

		
		if (stActuator.state != stActuator.CONSTANTS.States.State_Config) {
			throw "Bad state.";
		}
		
//		stActuator.config._controlSocket.on("disconnect", function() {
//			stActuator.config._controlSocket.removeAllListeners(stActuator.CONSTANTS.Messages.ActuatorStarted);
//			stActuator.config._controlSocket.removeAllListeners(stActuator.CONSTANTS.Messages.ActuatorStopped);
//
//		})
//		
//		stActuator.config._controlSocket.on( stActuator.CONSTANTS.Messages.ActuatorStarted, function(msg) {
//			stActuator.eventEmitter.emit( stActuator.CONSTANTS.Events.ActuatorStarted );
//		});
//		
//		stActuator.config._controlSocket.on( stActuator.CONSTANTS.Messages.ActuatorStopped, function(msg) {
//			stActuator.eventEmitter.emit( stActuator.CONSTANTS.Events.ActuatorStopped );
//
//		});
		
	}
	
	/**
	 * Start actuator
	 */
	start() {
		
		let stActuator = this;

		return new Promise(function(resolve, reject) {
			
			var request = {
				"actuatorID" : stActuator.config.actuatorID,
				"result" : null
				
			};
			
			stActuator.config._controlSocket.emit(stActuator.CONSTANTS.Messages.StartActuator , request);
			
			resolve(request);
			
		});

	}
	
	
	/**
	 * Stop actuator
	 */
	stop() {
		
		let stActuator = this;
		
		return new Promise(function(resolve, reject) {
			
			var request = {
				"actuatorID" : stActuator.config.actuatorID,
				"result" : null
				
			};
			
			stActuator.config._controlSocket.emit(stActuator.CONSTANTS.Messages.StopActuator , request);
			resolve(request);
		});
	}	
	
	
}


/**
 * ActuatorsManager
 */
class ActuatorsManager {
	
	
	constructor() {
		
		this.actuatorsList = [];
		this.eventEmitter = new EventEmitter();
		
		this.CONSTANTS = ActuatorsManager_CONSTANTS;

		
		this.nodeCtrlSrv = null;
	}
	
	
	/**
	 * Add Actuators from Node
	 */
	addActuatorsFromNode(stNode) {
		
		var amngr = this;
		let _stNode = stNode;
		
	  // · · · · · ·  # #  · · · · · ·  ###  · · · · · ·  # # · · · · · · |\/|···  
	  // Event NodeDisconnected
		stNode.eventEmitter.on( stNode.CONSTANTS.Events.NodeDisconnected, function(data) {

			var stActuators = amngr.getActuatorsByNode( data.node.config.nodeID );
			
			stActuators.actuators.forEach(function(actuator, _i, _actuators) {
				
				let actuatorSearch = amngr.getActuatorBy_sysID( actuator.config._sysID );
				if ( actuatorSearch.stActuator != null ) {
					amngr.actuatorsList.splice(actuatorSearch.position, 1);
				}
				
			});
			
		})
	  // · · · · · ·  # #  · · · · · ·  ###  · · · · · ·  # # · · · · · · |/\|···  
		
		
		// Map event disconnect
		stNode.socket.on("disconnect", function() {
			stNode.socket.removeAllListeners(amngr.CONSTANTS.Messages.ActuatorStarted);
			stNode.socket.removeAllListeners(amngr.CONSTANTS.Messages.ActuatorStopped);
			stNode.socket.removeAllListeners(amngr.CONSTANTS.Messages.ActuatorOptions);
			stNode.socket.removeAllListeners(amngr.CONSTANTS.Messages.ActuatorsList);

		});
	
		
		// Map Message ActuatorStarted
		stNode.socket.on( amngr.CONSTANTS.Messages.ActuatorStarted, function(msg) {
			amngr.eventEmitter.emit( amngr.CONSTANTS.Events.ActuatorStarted );	// Emit event ActuatorStarted
		});
		
		
		// Map Message ActuatorStopped
		stNode.socket.on( amngr.CONSTANTS.Messages.ActuatorStopped, function(msg) {
			amngr.eventEmitter.emit( amngr.CONSTANTS.Events.ActuatorStopped );	// Emit event ActuatorStopped

		});
		
		
		// Map Message ActuatorOptions
		stNode.socket.on( amngr.CONSTANTS.Messages.ActuatorOptions, function(msg) {
			
			amngr._msg_ActuatorOptions(msg, stNode, 
				{ "channelID":  msg.channelID,
					"options": msg.options
				});

		});
		
		
		// Map Message ActuatorsList
		stNode.socket.on(amngr.CONSTANTS.Messages.ActuatorsList, function(data){
			  
			amngr._msg_ActuatorsList(data, stNode, {"data" : data});
			  
		  });
		
		
		if ( stNode.config.numActuators > 0 ) {
			stNode.socket.emit( amngr.CONSTANTS.Messages.getActuatorsList ); 
		}
		
	}
	
	
	/**
	 * Add Actuator
	 */
	addActuator(config) {
		
		var stActuator = new Actuator( config );
		
	  // · · · · · ·  # #  · · · · · ·  ###  · · · · · ·  # # · · · · · · |\/|···  
	  // Event ActuatorStarted
		stActuator.eventEmitter.on(ActuatorsManager_CONSTANTS.Events.ActuatorStarted, function() {
			
			console.log('<···> ST ActuatorsManager.ActuatorStarted');	// TODO REMOVE DEBUG LOG
			console.log(' <···> ' + stActuator.config.id );	// TODO REMOVE DEBUG LOG
			
		});
	  // · · · · · ·  # #  · · · · · ·  ###  · · · · · ·  # # · · · · · · |/\|···  
		
		
	  // · · · · · ·  # #  · · · · · ·  ###  · · · · · ·  # # · · · · · · |\/|···  
	  // Event ActuatorStopped
		stActuator.eventEmitter.on(ActuatorsManager_CONSTANTS.Events.ActuatorStopped, function() {

			console.log('<···> ST ActuatorsManager.ActuatorStopped');	// TODO REMOVE DEBUG LOG
			console.log(' <···> ' + stActuator.config.id );	// TODO REMOVE DEBUG LOG
			
		});
	  // · · · · · ·  # #  · · · · · ·  ###  · · · · · ·  # # · · · · · · |/\|···  
		
			
		
		stActuator.initialize();
		this.actuatorsList.push( stActuator );
	}
	
	
	/**
	 * Returns Actuator searched by ID
	 */
	getActuatorBy_sysID(actuatorID) {

		var actuator = null;
		var _i = 0;
		
		for (_i = 0; _i < this.actuatorsList.length; _i++) {
			if (this.actuatorsList[_i].config._sysID == actuatorID) {
				actuator = this.actuatorsList[_i];
				break;
			}
		}
		
		return {
			"stActuator": actuator,
			"position": _i
		}
	}
	
	
	/**
	 * Returns Actuators searched by Node.ID
	 */
	getActuatorsByNode(nodeID) {
		
		var actuators = this.actuatorsList.filter(function(actuator, _i, _actuators) {
			
			if (actuator.config._refSTNodeID == nodeID) {
				return true;
			}
			
		});
		
		return {
			"numActuators": actuators.length,
			"actuators": actuators
		}
	}
	
	
	/**
	 * Turn off actuators of node
	 */
	turnOffActuatorsOfNode(nodeID) {
		
		let amngr = this;
//		let _nodeID = nodeID;
		
		console.log('<*> ST ActuatorsManager.turnOffActuatorsOfNode');	// TODO REMOVE DEBUG LOG
		console.log(nodeID);	// TODO REMOVE DEBUG LOG

		let actuatorsSearch = amngr.getActuatorsByNode(nodeID);
		
		if (actuatorsSearch.actuators != null) {
			console.log(' <·> Emit message');	// TODO REMOVE DEBUG LOG
			actuatorsSearch.actuators[0].config._controlSocket.emit(amngr.CONSTANTS.Messages.TurnOffActuators);
		} else {
			console.log(' <·> Node not found!!!');	// TODO REMOVE DEBUG LOG
		}
	
	}
	
	
	
	/**
	 * Get options of actuator
	 */
	getOptionsOfActuator(act) {
		
		let amngr = this;
		let controlSocket = act.config._controlSocket;
		
		console.log('<*> ST ActuatorsManager.getOptionsOfActuator');	// TODO REMOVE DEBUG LOG
		
		controlSocket.emit(smngr.CONSTANTS.Messages.getActuatorOptions, 
				{"actuatorID" : act.config.id});	// Emit message getActuatorOptions
		
	}
	
	
	/**
	 * Set options of actuator
	 */
	setOptionsOfActuator(act, options) {
		
		let amngr = this;
		let controlSocket = act.config._controlSocket;

		console.log('<*> ST ActuatorsManager.setOptionsOfActuator');	// TODO REMOVE DEBUG LOG
		console.log(options);	// TODO REMOVE DEBUG LOG
		
		controlSocket.emit(smngr.CONSTANTS.Messages.setActuatorOptions, 
				{"sensorID" : act.config.id, "options" : options});	// Emit message setSensorOptions
		

	}
	
	
	/**
	 * Message ActuatorsList
	 */
	_msg_ActuatorsList(msg, stNode, options) {
		
		let amngr = this;
		let controlSocket = stNode.socket;
		let data = options.data;
		
		  if (data.numActuators > 0 ) {
			  
			  data.actuators.forEach(function(act, _i) {
				  
				  act._sysID = stNode.config.nodeID + '.' + act.actuatorID;
				  act._refSTNode = stNode;
				  act._refSTNodeID = stNode.config.nodeID;
				  act._stNodeEvents = stNode.eventEmitter;
				  act._controlSocket = controlSocket;
	
				  amngr.addActuator( act );
				  
			  });
			  
		  }
		
	}
	
	
	
	/**
	 * Message ActuatorOptions
	 */
	_msg_ActuatorOptions(msg, stNode, options) {
		
		let smngr = this;
		let controlSocket = stNode.socket;

		console.log('<*> ST ActuatorsManager._msg_ActuatorOptions');	// TODO REMOVE DEBUG LOG
		console.log(options);	// TODO REMOVE DEBUG LOG
		
		
		
	}
	
}


module.exports = ActuatorsManager;