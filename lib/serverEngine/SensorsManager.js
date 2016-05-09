"use strict";

/*
 Sensors manager

 - Manages sensors
 - Adds sensors from node
 - Get sensor by id
 - Get sensors by node
 - Start/Stop sensor
 - Turn off sensors of node

*/


let EventEmitter = require('events').EventEmitter;


/**
 * SensorsManager CONSTANTS
 */
const SensorsManager_CONSTANTS = {
		"Config" : {
			"type_Vsensor" : "vsensor",
			"type_Cylonjs" : "cylonjs"

		},
		
		"States" : {
			"State_Config" : "config",
			"State_Ready" : "ready",
			"State_Working" : "working",
			"State_Stop" : "stop"
		},
		
		"Events" : {
			"SensorRemoved" : "Sensor Removed",
			
			"StartSensor" : "StartSensor",
			"SensorStarted" : "SensorStarted",
			"StopSensor" : "StopSensor",
			"SensorStopped" : "SensorStopped"

		},
		
		"Messages" : {
			"getSensorsList" : "Get Sensors List",
			"SensorsList" : "Sensors List",
			"getSensorInfo" : "Get Sensor Info",
			"SensorInfo" : "Sensor Info",
			"getSensorOptions" : "Get Sensor Options",
			"SensorOptions" : "Sensor Options",
			
			"StartSensor" : "StartSensor",
			"SensorStarted" : "SensorStarted",
			"StopSensor" : "StopSensor",
			"SensorStopped" : "SensorStopped",
			
			"TurnOffSensors" : "TurnOffSensors"
		}
	};


/**
 * Sensor
 */
class Sensor {
	
	constructor(config) {
		this.config = config;
		this.eventEmitter = new EventEmitter();
		
		this.CONSTANTS = SensorsManager_CONSTANTS;
		this.state = SensorsManager_CONSTANTS.States.State_Config;
		
	}
	
	
	/**
	 * Initialize
	 */
	initialize() {
		
		this.mapControlMessages();
		this.state = SensorsManager_CONSTANTS.States.State_Ready;
	}
	
	
	/**
	 * Map control messages
	 */
	mapControlMessages() {
		
		if (this.state != this.CONSTANTS.States.State_Config) {
			throw "Bad state.";
		}
		
		let stSensor = this;
		
		stSensor.config._controlSocket.on( stSensor.CONSTANTS.Messages.SensorStarted, function(msg) {
			stSensor.eventEmitter.emit( SensorsManager_CONSTANTS.Events.SensorStarted );
		});
		
		stSensor.config._controlSocket.on( stSensor.CONSTANTS.Messages.SensorStopped, function(msg) {
			stSensor.eventEmitter.emit( SensorsManager_CONSTANTS.Events.SensorStopped );

		});
		
	}
	
	
	/**
	 * Start sensor
	 */
	start() {
		
		let stSensor = this;
		
		return new Promise(function(resolve, reject) {
			
			var request = {
				"sensorID" : stSensor.config.sensorID,
				"result" : null
				
			};
			
			stSensor.config._controlSocket.emit(SensorsManager_CONSTANTS.Messages.StartSensor , request);
			
			resolve(request);
			
		});

	}
	
	
	/**
	 * Stop sensor
	 */
	stop() {
		
		let stSensor = this;
		
		return new Promise(function(resolve, reject) {
			
			var request = {
				"sensorID" : stSensor.config.sensorID,
				"result" : null
				
			};
			
			stSensor.config._controlSocket.emit(SensorsManager_CONSTANTS.Messages.StopSensor , request);
			resolve(request);
		});
	}
	
}


/**
 * Sensors Manager
 */
class SensorsManager {
	
	constructor() {
		
		this.sensorList = [];
		this.eventEmitter = new EventEmitter();
		
		this.CONSTANTS = SensorsManager_CONSTANTS;

		
		this.nodeCtrlSrv = null;
	}

	/**
	 * Add Sensors from Node
	 */
	addSensorsFromNode(stNode) {
		
		var smngr = this;
		let _stNode = stNode;
		
	  // · · · · · ·  # #  · · · · · ·  ###  · · · · · ·  # # · · · · · · |\/|···  
	  // Event NodeDisconnected
		stNode.eventEmitter.on( stNode.CONSTANTS.Events.NodeDisconnected, function(data) {

			var stSensors = smngr.getSensorsByNode( data.node.config.nodeID );
			
			stSensors.sensors.forEach(function(sensor, _i, _sensors) {
				
				var sensorSearch = smngr.getSensorBy_sysID( sensor.config._sysID );
				if ( sensorSearch.stSensor != null ) {
					smngr.sensorList.splice(sensorSearch.position, 1);
				}
				
			});
			
		})
	  // · · · · · ·  # #  · · · · · ·  ###  · · · · · ·  # # · · · · · · |/\|···  
		
	  // · · · · · ·  ¨¨¨  · · · · · ·  ¨¨¨  · · · · · ·  ¨¨¨  · · · · · · |\/|···  
	  // Message SensorsList
		stNode.socket.on(smngr.CONSTANTS.Messages.SensorsList, function(data){
			  
			  if (data.numSensors > 0 ) {
				  var _i = 0;
				  
				  for (var _i = 0; _i < data.sensors.length; _i++) {
					  
					  data.sensors[_i]._sysID = _stNode.config.nodeID + '.' + data.sensors[_i].sensorID;
					  data.sensors[_i]._refSTNode = _stNode.config.nodeID;
					  data.sensors[_i]._stNodeEvents = _stNode.eventEmitter;
					  data.sensors[_i]._controlSocket = _stNode.socket;

					  smngr.addSensor( data.sensors[_i] );
				  }
			  }
			  
		  });
	  // · · · · · ·  ¨¨¨  · · · · · ·  ¨¨¨  · · · · · ·  ¨¨¨  · · · · · · |/\|···  

		
		if ( stNode.config.numSensors > 0 ) {
			stNode.socket.emit( smngr.CONSTANTS.Messages.getSensorsList ); 
		}
		
	}
	
	
	/**
	 * Add Sensor
	 */
	addSensor(config) {
		let smngr = this;
		var stSensor = new Sensor( config );
		
	  // · · · · · ·  # #  · · · · · ·  ###  · · · · · ·  # # · · · · · · |\/|···  
	  // Event SensorStarted
		stSensor.eventEmitter.on(SensorsManager_CONSTANTS.Events.SensorStarted, function() {
			
			console.log('<···> ST SensorsManager.SensorStarted');	// TODO REMOVE DEBUG LOG
			console.log(' <···> ' + stSensor.config.id );	// TODO REMOVE DEBUG LOG
			
		});
	  // · · · · · ·  # #  · · · · · ·  ###  · · · · · ·  # # · · · · · · |/\|···  
		
		
	  // · · · · · ·  # #  · · · · · ·  ###  · · · · · ·  # # · · · · · · |\/|···  
	  // Event SensorStopped
		stSensor.eventEmitter.on(SensorsManager_CONSTANTS.Events.SensorStopped, function() {

			console.log('<···> ST SensorsManager.SensorStopped');	// TODO REMOVE DEBUG LOG
			console.log(' <···> ' + stSensor.config.id );	// TODO REMOVE DEBUG LOG
			
		});
	  // · · · · · ·  # #  · · · · · ·  ###  · · · · · ·  # # · · · · · · |/\|···  
		
		stSensor.initialize();
		this.sensorList.push( stSensor );
	}
	
	
	/**
	 * Returns Sensor searched by ID
	 */
	getSensorBy_sysID(sensorID) {

		var sensor = null;
		var _i = 0;
		
		for (_i = 0; _i < this.sensorList.length; _i++) {
			if (this.sensorList[_i].config._sysID == sensorID) {
				sensor = this.sensorList[_i];
				break;
			}
		}
		
		return {
			"stSensor": sensor,
			"position": _i
		}
	}
	

	/**
	 * Returns Sensors searched by Node.ID
	 */
	getSensorsByNode(nodeID) {
		
		var sensors = this.sensorList.filter(function(sensor, _i, _sensors) {
			
			if (sensor.config._refSTNode == nodeID) {
				return true;
			}
			
		});
		
		return {
			"numSensors": sensors.length,
			"sensors": sensors
		}
	}
	
	/**
	 * Turn off sensors of node
	 */
	turnOffSensorsOfNode(nodeID) {
		
		let smngr = this;
//		let _nodeID = nodeID;
		
		console.log('<*> ST SensorsManager.turnOffSensorsOfNode');	// TODO REMOVE DEBUG LOG
		console.log(nodeID);	// TODO REMOVE DEBUG LOG

		let sensorsSearch = smngr.getSensorsByNode(nodeID);
		
		if (sensorsSearch.sensors != null) {
			console.log(' <·> Emit message');	// TODO REMOVE DEBUG LOG
			sensorsSearch.sensors[0].config._controlSocket.emit(smngr.CONSTANTS.Messages.TurnOffSensors);
		} else {
			console.log(' <·> Node not found!!!');	// TODO REMOVE DEBUG LOG
		}
	
	}
	
}


module.exports = SensorsManager;