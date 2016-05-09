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
			"ActuatorOptions" : "Actuator Options",
			
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
		
		if (this.state != this.CONSTANTS.States.State_Config) {
			throw "Bad state.";
		}
		
		let stActuator = this;
		
		stActuator.config._controlSocket.on( stActuator.CONSTANTS.Messages.ActuatorStarted, function(msg) {
			stActuator.eventEmitter.emit( stActuator.CONSTANTS.Events.ActuatorStarted );
		});
		
		stActuator.config._controlSocket.on( stActuator.CONSTANTS.Messages.ActuatorStopped, function(msg) {
			stActuator.eventEmitter.emit( stActuator.CONSTANTS.Events.ActuatorStopped );

		});
		
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
				
				var actuatorSearch = amngr.getActuatorBy_sysID( actuator.config._sysID );
				if ( actuatorSearch.stActuator != null ) {
					amngr.actuatorsList.splice(actuatorSearch.position, 1);
				}
				
			});
			
		})
	  // · · · · · ·  # #  · · · · · ·  ###  · · · · · ·  # # · · · · · · |/\|···  
		
	  // · · · · · ·  ¨¨¨  · · · · · ·  ¨¨¨  · · · · · ·  ¨¨¨  · · · · · · |\/|···  
	  // Message ActuatorsList
		stNode.socket.on(amngr.CONSTANTS.Messages.ActuatorsList, function(data){
			  
			  if (data.numActuators > 0 ) {
				  var _i = 0;
				  
				  for (var _i = 0; _i < data.actuators.length; _i++) {
					  
					  data.actuators[_i]._sysID = _stNode.config.nodeID + '.' + data.actuators[_i].actuatorID;
					  data.actuators[_i]._refSTNode = _stNode.config.nodeID;
					  data.actuators[_i]._stNodeEvents = _stNode.eventEmitter;
					  data.actuators[_i]._controlSocket = _stNode.socket;

					  amngr.addActuator( data.actuators[_i] );
				  }
			  }
			  
		  });
	  // · · · · · ·  ¨¨¨  · · · · · ·  ¨¨¨  · · · · · ·  ¨¨¨  · · · · · · |/\|···  
		
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
			
			if (actuator.config._refSTNode == nodeID) {
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
	
}


module.exports = ActuatorsManager;