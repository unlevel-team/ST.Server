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
		
		this.options = null;
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

		
		if (stActuator.state !== stActuator.CONSTANTS.States.State_Config) {
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
		
		let amngr = this;
		let _stNode = stNode;
		
		
		// ~ ~ ~ ~ ~ ~  # #  ~ ~ ~ ~ ~ ~  ###  ~ ~ ~ ~ ~ ~  # # ~ ~ ~ ~ ~ ~ |\/|~~~  
		// Event NodeDisconnected
		stNode.eventEmitter.on( stNode.CONSTANTS.Events.NodeDisconnected, function(data) {

			let stActuators = amngr.getActuatorsByNode( data.node.config.nodeID );
			
			stActuators.actuators.forEach(function(actuator, _i, _actuators) {
				
				let actuatorSearch = amngr.getActuatorBy_sysID( actuator.config._sysID );
				if ( actuatorSearch.stActuator !== null ) {
					amngr.actuatorsList.splice(actuatorSearch.position, 1);
				}
				
			});
			
		});
		// ~ ~ ~ ~ ~ ~  # #  ~ ~ ~ ~ ~ ~  ###  ~ ~ ~ ~ ~ ~  # # ~ ~ ~ ~ ~ ~ |/\|~~~  
		
		
		// Map event disconnect
		stNode.socket.on("disconnect", function() {
			stNode.socket.removeAllListeners(amngr.CONSTANTS.Messages.ActuatorStarted);
			stNode.socket.removeAllListeners(amngr.CONSTANTS.Messages.ActuatorStopped);
			stNode.socket.removeAllListeners(amngr.CONSTANTS.Messages.ActuatorOptions);
			stNode.socket.removeAllListeners(amngr.CONSTANTS.Messages.ActuatorOptionsUpdated);
			stNode.socket.removeAllListeners(amngr.CONSTANTS.Messages.ActuatorsList);

		});
	
		
		// Map Message ActuatorStarted
		stNode.socket.on( amngr.CONSTANTS.Messages.ActuatorStarted, function(msg) {
			
			
			
			// Emit event ActuatorStarted
			amngr.eventEmitter.emit( amngr.CONSTANTS.Events.ActuatorStarted );
		});
		
		
		// Map Message ActuatorStopped
		stNode.socket.on( amngr.CONSTANTS.Messages.ActuatorStopped, function(msg) {
			
			
			
			
			// Emit event ActuatorStopped
			amngr.eventEmitter.emit( amngr.CONSTANTS.Events.ActuatorStopped );	
		});
		
		
		// Map Message ActuatorOptions
		stNode.socket.on( amngr.CONSTANTS.Messages.ActuatorOptions, function(msg) {
			
			amngr._msg_ActuatorOptions(msg, stNode, 
				{ "actuatorID":  msg.actuatorID,
					"options": msg.options
				});

		});
		
		
		// Map Message ActuatorOptionsUpdated
		stNode.socket.on( amngr.CONSTANTS.Messages.ActuatorOptionsUpdated, function(msg) {
			
			amngr._msg_ActuatorOptionsUpdated(msg, stNode, {  "actuatorID":  msg.actuatorID	});

		});
		
		
		// Map Message ActuatorsList
		stNode.socket.on(amngr.CONSTANTS.Messages.ActuatorsList, function(data){
			  
			amngr._msg_ActuatorsList(data, stNode, {"data" : data});
			  
		  });
		
		
		if ( stNode.config.numActuators > 0 ) {
			
			// Emit message getActuatorsList
			stNode.socket.emit( amngr.CONSTANTS.Messages.getActuatorsList ); 
		}
		
	}
	
	
	/**
	 * Add Actuator
	 */
	addActuator(config) {
		
		let amngr = this;
		let stActuator = new Actuator( config );
		
		let controlSocket = stActuator.config._controlSocket;
		
		// Event ActuatorStarted
		stActuator.eventEmitter.on(ActuatorsManager_CONSTANTS.Events.ActuatorStarted, function() {
			
			console.log('<*> ST ActuatorsManager.ActuatorStarted');	// TODO REMOVE DEBUG LOG
			console.log(' <~~~> ' + stActuator.config.id );	// TODO REMOVE DEBUG LOG
			
		});
		
		
		// Event ActuatorStopped
		stActuator.eventEmitter.on(ActuatorsManager_CONSTANTS.Events.ActuatorStopped, function() {

			console.log('<*> ST ActuatorsManager.ActuatorStopped');	// TODO REMOVE DEBUG LOG
			console.log(' <~~~> ' + stActuator.config.id );	// TODO REMOVE DEBUG LOG
			
		});
			
		
		stActuator.initialize();
		amngr.actuatorsList.push( stActuator );
		
		// Emit message getActuatorOptions
		controlSocket.emit(amngr.CONSTANTS.Messages.getActuatorOptions, {"actuatorID": stActuator.config.actuatorID});

	}
	
	
	/**
	 * Returns Actuator searched by ID
	 */
	getActuatorBy_sysID(actuatorID) {

		let amngr = this;
		let actuator = null;
		let _i = 0;
		
		_i = amngr.actuatorsList.map(function(x) {return x.config._sysID; }).indexOf(actuatorID);
		if (_i !== -1) {
			actuator = amngr.actuatorsList[_i];
		}
		
//		for (_i = 0; _i < amngr.actuatorsList.length; _i++) {
//			if (amngr.actuatorsList[_i].config._sysID === actuatorID) {
//				actuator = amngr.actuatorsList[_i];
//				break;
//			}
//		}
		
		return {
			"stActuator": actuator,
			"position": _i
		};
		
	}
	
	
	/**
	 * Returns Actuators searched by Node.ID
	 */
	getActuatorsByNode(nodeID) {
		
		let amngr = this;
		
		var actuators = amngr.actuatorsList.filter(function(actuator, _i, _actuators) {
			
			if (actuator.config._refSTNodeID === nodeID) {
				return true;
			}
			
		});
		
		return {
			"numActuators": actuators.length,
			"actuators": actuators
		};
		
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
		
		if (actuatorsSearch.actuators !== null) {
			
			console.log(' <~> Emit message');	// TODO REMOVE DEBUG LOG
			
			// Emit message TurnOffActuators
			actuatorsSearch.actuators[0].config._controlSocket.emit(amngr.CONSTANTS.Messages.TurnOffActuators);
			
		} else {
			console.log(' <~> Node not found!!!');	// TODO REMOVE DEBUG LOG
		}
	
	}
	
	
	
	/**
	 * Get options of actuator
	 */
	getOptionsOfActuator(act) {
		
		let amngr = this;
		let controlSocket = act.config._controlSocket;
		
		console.log('<*> ST ActuatorsManager.getOptionsOfActuator');	// TODO REMOVE DEBUG LOG
		
		// Emit message getActuatorOptions
		controlSocket.emit(amngr.CONSTANTS.Messages.getActuatorOptions, 
				{"actuatorID" : act.config.actuatorID});
		
	}
	
	
	/**
	 * Set options of actuator
	 */
	setOptionsOfActuator(act, options) {
		
		let amngr = this;
		let controlSocket = act.config._controlSocket;

		console.log('<*> ST ActuatorsManager.setOptionsOfActuator');	// TODO REMOVE DEBUG LOG
		console.log(options);	// TODO REMOVE DEBUG LOG
		
		controlSocket.emit(amngr.CONSTANTS.Messages.setActuatorOptions, 
				{"actuatorID" : act.config.actuatorID, "options" : options});	// Emit message setSensorOptions

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
		
		let amngr = this;
		let controlSocket = stNode.socket;

		console.log('<*> ST ActuatorsManager._msg_ActuatorOptions');	// TODO REMOVE DEBUG LOG
		console.log(options);	// TODO REMOVE DEBUG LOG
		
		let actuatorID = options.actuatorID;
		let actuatorOptions = options.options;
		
		let actuator_sysID = stNode.config.nodeID + '.' + actuatorID;
		
		let response = {
				"actuatorID": actuatorID
		};
		
		
		try {
			
			let actuatorSearch = amngr.getActuatorBy_sysID(actuator_sysID);
			if (actuatorSearch.stActuator === null) {
				throw "Sensor not found";
			}
			
			let act = actuatorSearch.stActuator;
			
			act.options = actuatorOptions;
			
		} catch (e) {
			// TODO: handle exception
			response.result = "ERROR";
			response.error = e;
			
		  console.log('<EEE> NodesNetManager._msg_ActuatorOptions ERROR');	// TODO REMOVE DEBUG LOG
		  console.log(response);	// TODO REMOVE DEBUG LOG
		}
		
	}
	
	
	/**
	 * Message ActuatorOptionsUpdated
	 */
	_msg_ActuatorOptionsUpdated(msg, stNode, options) {
		
		let amngr = this;
		
		let actuatorID = options.actuatorID;
		let controlSocket = stNode.socket;
		
		let actuator_sysID = stNode.config.nodeID + '.' + actuatorID;

		
		let response = {
				"actuatorID": actuatorID
		};
		
		
		console.log('<*> ST ActuatorsManager.ActuatorOptionsUpdated');	// TODO REMOVE DEBUG LOG
		console.log(msg);	// TODO REMOVE DEBUG LOG
		
		try {
			
			let actuatorSearch = amngr.getActuatorBy_sysID(actuator_sysID);
			if (actuatorSearch.stActuator === null) {
				throw "Actuator not found";
			}
			
			let act = actuatorSearch.stActuator;
			
			amngr.getOptionsOfActuator(act);
			
		} catch (e) {
			// TODO: handle exception
			response.result = "ERROR";
			response.error = e;
			
		  console.log('<EEE> ActuatorsManager._msg_ActuatorOptionsUpdated ERROR');	// TODO REMOVE DEBUG LOG
		  console.log(response);	// TODO REMOVE DEBUG LOG
		}
		
	}
	
}


module.exports = ActuatorsManager;