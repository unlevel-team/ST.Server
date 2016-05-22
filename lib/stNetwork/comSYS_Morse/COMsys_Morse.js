"use strict";

/**
 * COMSystem library
 * 
 * Provides communications system to ST network
 * 
 * 
 * v. Morse
 */


let DataMessage = require('../DataChannel.js').DataMessage;

let ThingBind = require('../COMSystem.js').ThingBind;
let COMSystem = require('../COMSystem.js').COMSystem;

let COMSys_Morse_Srv_Node = require('./csysMorse_Services.js').COMSys_Morse_Srv_Node;
let COMSys_Morse_Srv_Server = require('./csysMorse_Services.js').COMSys_Morse_Srv_Server;



const COMSystem_Morse_CONSTANTS = {
	"Config" : {
		"Version" : "Morse"
	}
}


/**
 * ThingBind
 */
class TBind_Morse extends ThingBind {
	
	constructor(type, source, target, options) {
		super(type, source, target, options);
		
		this._bindFunction = null;
	}
	
	
	/**
	 * Start Bind
	 */
	start() {
		
		let tbind = this;
		
		if (tbind.state != tbind.CONSTANTS.States.State_Ready) {
			throw "Bad Bind state";
		}
		
		super.start();
	
	}
	

	/**
	 * Stop Bind
	 */
	stop() {
		
		let tbind = this;
		
		if (tbind.state != tbind.CONSTANTS.States.State_Working) {
			throw "Bad Bind state";
		}
		
		super.stop();
	}
	
}


/**
 * ThingBindfor role Node
 * 
 */
class TBind_Morse_Node extends TBind_Morse {
	
	constructor(type, source, target, options) {
		super(type, source, target, options);
	}
	
	
	/**
	 * Bind DC to Sensor
	 */
	_init_DCtoSensor() {
		
		let tbind = this;
		
		let dc = tbind.target;
		let sensor = tbind.source;
		
		if (tbind.options == undefined || 
				tbind.options.bindID == undefined) {
			throw "This bind requires an ID.";
		}
		
		
		tbind.bindID = tbind.CONSTANTS.Config.BindType_DCtoSensor + tbind.options.bindID;	// Set bind ID
		
		// Define bind function
		tbind._bindFunction = function(data) {
			
			if (tbind.state != tbind.CONSTANTS.States.State_Working) {
				return;
			}
			
			if (tbind.options.bindFunction) {
				tbind.options.bindFunction(data);
			}
			
			let msg = new DataMessage(data);
			msg.typeExtra = tbind.CONSTANTS.Config.Version;
			msg._Morse = {
				"bindID": tbind.bindID
			}
			
			dc.sendMessage(msg);
		};
		
		
		// Map event SensorData
		sensor.eventEmitter.on(sensor.CONSTANTS.Events.SensorData, tbind._bindFunction );
		
		tbind.state = tbind.CONSTANTS.States.State_Ready;
	}
	
	
	/**
	 * Bind DC to Actuator
	 */
	_init_DCtoActuator() {
		
		let tbind = this;
		let dc = tbind.source;
		let actuator = tbind.target;
		
		if (tbind.options == undefined || 
				tbind.options.bindID == undefined) {
			throw "This bind requires an ID.";
		}
		
		if (tbind.options.comSYS == undefined) {
			throw "This bind requires a comSYS.";
		}
		
		
		let comSYS = tbind.options.comSYS;
		
		tbind.bindID = tbind.CONSTANTS.Config.BindType_DCtoActuator + tbind.options.bindID;	// Set bind ID
		
		
		// Define bind function
		tbind._bindFunction = function(data) {
			
			if (tbind.state != tbind.CONSTANTS.States.State_Working) {
				return;
			}
			
			if (tbind.options.bindFunction) {
				tbind.options.bindFunction(data);
			}
			
			actuator.emit(actuator.CONSTANTS.Events.ActuatorData, data);	// Emit event ActuatorData
			
		};
		
		
		comSYS.bindDC(dc);	// Bind Communications system to DC
		
		// Map event `bindID`
		comSYS.eventEmitter.on(tbind.bindID, tbind._bindFunction);
		
		
	}
	
	/**
	 * Unbind
	 */
	unbind() {
		
		let tbind = this;
		
		switch (tbind.type) {
		
			case tbind.CONSTANTS.Config.BindType_DCtoSensor:
				
				let sensor = tbind.target;
				
				// UnMap event SensorData
				sensor.eventEmitter.removeListener(sensor.CONSTANTS.Events.SensorData, tbind._bindFunction);
				break;
				
			case tbind.CONSTANTS.Config.BindType_DCtoActuator:
				
				let comSYS = tbind.options.comSYS;
				
				// UnMap event `bindID`
				comSYS.eventEmitter.removeListener(tbind.bindID, tbind._bindFunction);
				break;
	
			default:
				break;
			
			}

		super.unbind();
	}
}


/**
 * Communications System
 */
class COMSystem_Morse extends COMSystem {
	
	constructor(config) {
		
		super(config);
		
		this.MorseCONSTANTS = COMSystem_Morse_CONSTANTS;
		
		this._service = null;
		
		
		this.CONSTANTS.Config.Version = COMSystem_Morse_CONSTANTS.Config.Version;
		
	}
	
	
	initialize() {
		
		super.initialize();
		
		let comSYS = this;
		let _config = comSYS.config;
		
		if (_config.role == undefined) {
			throw "role is required.";
		}
		
		if (_config.sensorManager == undefined) {
			throw "sensorManager is required.";
		}
		
		if (_config.actuatorsManager == undefined) {
			throw "actuatorsManager is required.";
		}
		
		comSYS.role = _config.role;
		
		switch (comSYS.role) {
		
			case comSYS.CONSTANTS.Config.Role_Node:
				comSYS._init_RoleNode();
				break;
				
				
			case comSYS.CONSTANTS.Config.Role_Server:
				comSYS._init_RoleServer();
				break;
	
			default:
				throw "Bad Role.";
				break;
		}
		
		
	}
	
	
	/**
	 * Initialize Node role
	 */
	_init_RoleNode() {
		
		let comSYS = this;
		let _config = comSYS.config;
		
		if (_config.controlChannel == undefined) {
			throw "controlChannel is required.";
		}
		
		comSYS._service = new COMSys_Morse_Srv_Node(comSYS);
	}
	
	
	/**
	 * Initialize Server role
	 */
	_init_RoleServer() {
		
		let comSYS = this;
		let _config = comSYS.config;
		
		comSYS._service = new COMSys_Morse_Srv_Server(comSYS);
	}
	
	
	/**
	 * Bind data channel
	 */
	bindDC(dc) {
		
		let comSYS = this;
		
		if (dc.config._comSYS_Morse != undefined && 
				dc.config._comSYS_Morse != null) {
			return;
		}
		
		dc.config._comSYS_Morse = true;
		
		// Map event MessageReceived
		dc.eventEmitter.on(dc.CONSTANTS.Events.MessageReceived, comSYS._DC_Message);
		
	}
	
	
	/**
	 * Unbind data channel
	 */
	unbindDC(dc) {
		
		let comSYS = this;
		
		if (dc.config._comSYS_Morse == undefined ||
				dc.config._comSYS_Morse == null) {
			return;
		}
		
		// UnMap event MessageReceived
		dc.eventEmitter.removeListener(dc.CONSTANTS.Events.MessageReceived, comSYS._DC_Message);
		
		dc.config._comSYS_Morse = null;
		
	}
	
	
	/**
	 * Data channel message
	 */
	_DC_Message(msg) {
		
		let comSYS = this;
		
		
		let messages = msg.filter(function(_msg, _i) {
			if (_msg.typeExtra != undefined && 
					_msg.typeExtra == comSYS.CONSTANTS.Config.Version) {
				return true;
			}
		});
		
		
		messages.forEach(function(_msg, _i) {
			comSYS.eventEmitter.emit(_msg._Morse.bindID, _msg);	// Emit event {bindID}
		});
		
	}
	
}


let cysMorse_Lib = {
		"TBind_Morse" : TBind_Morse,
		"TBind_Morse_Node" : TBind_Morse_Node,
		"COMSystem_Morse" : COMSystem_Morse
}


module.exports = cysMorse_Lib;
