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
			"SensorStopped" : "SensorStopped",

			"SetSensorOPsonNode" : "Set SNS OPs on Node"

		},

		"Messages" : {
			"getSensorsList" : "Get Sensors List",
			"SensorsList" : "Sensors List",
			"getSensorInfo" : "Get Sensor Info",
			"SensorInfo" : "Sensor Info",
			"getSensorOptions" : "Get Sensor Options",
			"setSensorOptions" : "Set Sensor Options",
			"SensorOptions" : "Sensor Options",
			"SensorOptionsUpdated" : "Sensor Options Updated",


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

		this.options = null;

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

		let stSensor = this;

		if (stSensor.state !== stSensor.CONSTANTS.States.State_Config) {
			throw "Bad state.";
		}



	}


	/**
	 * Start sensor
	 */
	start() {

		let stSensor = this;

		return new Promise(function(resolve, reject) {

			let request = {
				"sensorID" : stSensor.config.sensorID,
				"result" : null

			};

			// Emit message StartSensor
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

			let request = {
				"sensorID" : stSensor.config.sensorID,
				"result" : null

			};

			// Emit message StopSensor
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

		let smngr = this;
		let _stNode = stNode;

		// ~ ~ ~ ~ ~ ~  # #  ~ ~ ~ ~ ~ ~  ###  ~ ~ ~ ~ ~ ~  # # ~ ~ ~ ~ ~ ~ |\/|~~~
		// Event NodeDisconnected
		stNode.eventEmitter.on( stNode.CONSTANTS.Events.NodeDisconnected, function(data) {

			let stSensors = smngr.getSensorsByNode( data.node.config.nodeID );

			stSensors.sensors.forEach(function(sensor, _i, _sensors) {

				let sensorSearch = smngr.getSensorBy_sysID( sensor.config._sysID );
				if ( sensorSearch.stSensor !== null ) {
					smngr.sensorList.splice(sensorSearch.position, 1);
				}

			});

		});
		// ~ ~ ~ ~ ~ ~  # #  ~ ~ ~ ~ ~ ~  ###  ~ ~ ~ ~ ~ ~  # # ~ ~ ~ ~ ~ ~ |/\|~~~


		// Map event disconnect
		stNode.socket.on("disconnect", function() {
			stNode.socket.removeAllListeners(smngr.CONSTANTS.Messages.SensorStarted);
			stNode.socket.removeAllListeners(smngr.CONSTANTS.Messages.SensorStopped);
			stNode.socket.removeAllListeners(smngr.CONSTANTS.Messages.SensorsList);
			stNode.socket.removeAllListeners(smngr.CONSTANTS.Messages.SensorOptions);
			stNode.socket.removeAllListeners(smngr.CONSTANTS.Messages.SensorOptionsUpdated);

		});


		// Map message SensorStarted
		stNode.socket.on( smngr.CONSTANTS.Messages.SensorStarted, function(msg) {
			
			let stSensors = smngr.getSensorBy_sysID(stNode.config.nodeID + msg.sensorID);
			if (stSensors.stSensor === null) {
				throw "Sensor not found.";
			}
			
			let stSensor = stSensors.stSensor;
			
			// Emit event SensorStarted
			stSensor.eventEmitter.emit( SensorsManager_CONSTANTS.Events.SensorStarted );
			
		});


		// Map message SensorStopped
		stNode.socket.on( smngr.CONSTANTS.Messages.SensorStopped, function(msg) {
			
			let stSensors = smngr.getSensorBy_sysID(stNode.config.nodeID + msg.sensorID);
			if (stSensors.stSensor === null) {
				throw "Sensor not found.";
			}
			
			let stSensor = stSensors.stSensor;
			
			// Emit event SensorStopped
			stSensor.eventEmitter.emit( SensorsManager_CONSTANTS.Events.SensorStopped );

		});

		
		// Map Message SensorsList
		stNode.socket.on(smngr.CONSTANTS.Messages.SensorsList, function(msg){

			smngr._msg_SensorsList(msg, stNode, {"data" : msg});

		});


		// Map message SensorOptions
		stNode.socket.on(smngr.CONSTANTS.Messages.SensorOptions, function(msg) {

			smngr._msg_SensorOptions(msg, stNode, {
				"sensorID" : msg.sensorID,
				"options" : msg.options
			});

		});


		// Map message SensorOptions
		stNode.socket.on(smngr.CONSTANTS.Messages.SensorOptionsUpdated, function(msg) {

			smngr._msg_SensorOptionsUpdated(msg, stNode, {
				"sensorID" : msg.sensorID
			});

		});


		if ( stNode.config.numSensors > 0 ) {

			// Emit message getSensorsList
			stNode.socket.emit( smngr.CONSTANTS.Messages.getSensorsList );
		}

	}


	/**
	 * Add Sensor
	 */
	addSensor(config) {

		let smngr = this;


		let stSensor = new Sensor( config );

		let controlSocket = stSensor.config._controlSocket;

	  // Event SensorStarted
		stSensor.eventEmitter.on(SensorsManager_CONSTANTS.Events.SensorStarted, function() {

			console.log('<*> ST SensorsManager.SensorStarted');	// TODO REMOVE DEBUG LOG
			console.log(' <~~~> ' + stSensor.config.id );	// TODO REMOVE DEBUG LOG

		});
	  // ~ ~ ~ ~ ~ ~  # #  ~ ~ ~ ~ ~ ~  ###  ~ ~ ~ ~ ~ ~  # # ~ ~ ~ ~ ~ ~ |/\|~~~


	  // ~ ~ ~ ~ ~ ~  # #  ~ ~ ~ ~ ~ ~  ###  ~ ~ ~ ~ ~ ~  # # ~ ~ ~ ~ ~ ~ |\/|~~~
	  // Event SensorStopped
		stSensor.eventEmitter.on(SensorsManager_CONSTANTS.Events.SensorStopped, function() {

			console.log('<*> ST SensorsManager.SensorStopped');	// TODO REMOVE DEBUG LOG
			console.log(' <~~~> ' + stSensor.config.id );	// TODO REMOVE DEBUG LOG

		});
	  // ~ ~ ~ ~ ~ ~  # #  ~ ~ ~ ~ ~ ~  ###  ~ ~ ~ ~ ~ ~  # # ~ ~ ~ ~ ~ ~ |/\|~~~

		stSensor.initialize();
		smngr.sensorList.push( stSensor );

		// Emit message getSensorOptions
		controlSocket.emit(smngr.CONSTANTS.Messages.getSensorOptions, {"sensorID": stSensor.config.sensorID});

	}


	/**
	 * Returns Sensor searched by ID
	 */
	getSensorBy_sysID(sensorID) {

		let smngr = this;

		let sensor = null;
		let _i = 0;


		_i = smngr.sensorList.map(function(x) {return x.config._sysID; }).indexOf(sensorID);
		if (_i !== -1) {
			sensor = smngr.sensorList[_i];
		}

		// for (_i = 0; _i < smngr.sensorList.length; _i++) {
		// 	if (smngr.sensorList[_i].config._sysID == sensorID) {
		// 		sensor = smngr.sensorList[_i];
		// 		break;
		// 	}
		// }

		return {
			"stSensor": sensor,
			"position": _i
		};
		
	}


	/**
	 * Returns Sensors searched by Node.ID
	 */
	getSensorsByNode(nodeID) {

		let smngr = this;

		let sensors = smngr.sensorList.filter(function(sensor, _i, _sensors) {

			if (sensor.config._refSTNodeID === nodeID) {
				return true;
			}

		});

		return {
			"numSensors": sensors.length,
			"sensors": sensors
		};
		
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

		if (sensorsSearch.sensors !== null) {
			
			console.log(' <~> Emit message');	// TODO REMOVE DEBUG LOG
			
			// Emit message TurnOffSensors
			sensorsSearch.sensors[0].config._controlSocket.emit(smngr.CONSTANTS.Messages.TurnOffSensors);
			
		} else {
			console.log(' <~> Node not found!!!');	// TODO REMOVE DEBUG LOG
		}

	}


	/**
	 * Get options of sensor
	 */
	getOptionsOfSensor(sns) {

		let smngr = this;
		let controlSocket = sns.config._controlSocket;

		console.log('<*> ST SensorsManager.getOptionsOfSensor');	// TODO REMOVE DEBUG LOG

		// Emit message getSensorOptions
		controlSocket.emit(smngr.CONSTANTS.Messages.getSensorOptions,
				{"sensorID" : sns.config.sensorID});

	}


	/**
	 * Set options of sensor
	 */
	setOptionsOfSensor(sns, options) {

		let smngr = this;
		let controlSocket = sns.config._controlSocket;

		console.log('<*> ST SensorsManager.setOptionsOfSensor');	// TODO REMOVE DEBUG LOG
		console.log(options);	// TODO REMOVE DEBUG LOG

		// Emit message setSensorOptions
		controlSocket.emit(smngr.CONSTANTS.Messages.setSensorOptions,
				{"sensorID" : sns.config.sensorID, "options" : options});


	}


	/**
	 * Message SensorList
	 */
	_msg_SensorsList(msg, stNode, options) {

		let smngr = this;
		let controlSocket = stNode.socket;
		let data = options.data;

		  if (data.numSensors > 0 ) {

			  data.sensors.forEach(function(snsDATA, _i) {

				  snsDATA._sysID = stNode.config.nodeID + '.' + snsDATA.sensorID;
				  snsDATA._refSTNodeID = stNode.config.nodeID;

				  snsDATA._stNodeEvents = stNode.eventEmitter;
				  snsDATA._controlSocket = controlSocket;

				  smngr.addSensor( snsDATA );

			  });
		  }

	}


	/**
	 * Message SensorOptions
	 */
	_msg_SensorOptions(msg, stNode, options) {

		let smngr = this;

		let sensorID = options.sensorID;
		let sensorOptions = options.options;

		let sensor_sysID = stNode.config.nodeID + '.' + sensorID;

		let response = {
				"sensorID": sensorID
		};

		console.log('<*> ST SensorsManager._msg_SensorOptions');	// TODO REMOVE DEBUG LOG
		console.log(msg);	// TODO REMOVE DEBUG LOG

		try {

			let sensorSearch = smngr.getSensorBy_sysID(sensor_sysID);
			if (sensorSearch.stSensor === null) {
				throw "Sensor not found";
			}

			let sns = sensorSearch.stSensor;

			sns.options = sensorOptions;

		} catch (e) {
			// TODO: handle exception
			response.result = "ERROR";
			response.error = e;

		  console.log('<EEE> SensorsManager._msg_SensorOptions ERROR');	// TODO REMOVE DEBUG LOG
		  console.log(response);	// TODO REMOVE DEBUG LOG
		}

	}


	/**
	 * Message SensorOptionsUpdated
	 */
	_msg_SensorOptionsUpdated(msg, stNode, options) {

		let smngr = this;

		let sensorID = options.sensorID;
		let controlSocket = stNode.socket;

		let sensor_sysID = stNode.config.nodeID + '.' + sensorID;


		let response = {
			"sensorID": sensorID
		};


		console.log('<*> ST SensorsManager.SensorOptionsUpdated');	// TODO REMOVE DEBUG LOG
		console.log(options);	// TODO REMOVE DEBUG LOG

		try {

			let sensorSearch = smngr.getSensorBy_sysID(sensor_sysID);
			if (sensorSearch.stSensor === null) {
				throw "Sensor not found";
			}

			let sns = sensorSearch.stSensor;

			smngr.getOptionsOfSensor(sns);

		} catch (e) {
			// TODO: handle exception
			response.result = "ERROR";
			response.error = e;

		  console.log('<EEE> SensorsManager._msg_SensorOptionsUpdated ERROR');	// TODO REMOVE DEBUG LOG
		  console.log(response);	// TODO REMOVE DEBUG LOG
		}

	}

}


module.exports = SensorsManager;
