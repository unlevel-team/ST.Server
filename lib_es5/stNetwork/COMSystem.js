"use strict";

/**
 * COMSystem library
 * 
 * Provides communications system to ST network
 * 
 */

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var EventEmitter = require('events').EventEmitter;

var DataMessage = require('./DataChannel.js').DataMessage;

var COMSystem_CONSTANTS = {

	"Config": {

		"Role_Server": "Server",
		"Role_Node": "Node",

		"BindType_DCtoSensor": "DCtoSensor",
		"BindType_DCtoActuator": "DCtoActuator"
	},

	"States": {
		"State_Config": "config",
		"State_Ready": "ready",
		"State_Working": "working",
		"State_Stop": "stop"
	},

	"Events": {
		"Bind_Started": "BindStarted",
		"Bind_Stopped": "BindStopped",
		"Unbind": "Unbind",

		"Bind_Added": "BindAdded",
		"Bind_Removed": "BindRemoved"

	},

	"Messages": {
		"getBindList": "Get BindList",
		"BindList": "BindList",

		"createBind": "Create Bind",
		"Bind_Created": "BindCreated",
		"getBindOptions": "Get BindOptions",
		"setBindOptions": "Set BindOptions",
		"BindOptionsUpdated": "BindOptionsUpdated",
		"startBind": "Start Bind",

		"BindStarted": "Bind Started",
		"UnBind": "UnBind",
		"BindFree": "BindFree",

		"ErrorInfo": "ErrorInfo"
	}

};

/**
 * ThingBind
 */

var ThingBind = function () {
	function ThingBind(type, source, target, options) {
		_classCallCheck(this, ThingBind);

		this.CONSTANTS = COMSystem_CONSTANTS;

		this.version = null;

		this.bindID = null;
		this.type = type;
		this.role = null;
		this.state = this.CONSTANTS.States.State_Config;

		this.source = source;
		this.target = target;
		this.options = options;

		this.eventEmitter = new EventEmitter();
	}

	_createClass(ThingBind, [{
		key: 'initialize',
		value: function initialize() {

			var tbind = this;

			switch (tbind.type) {
				case tbind.CONSTANTS.Config.BindType_DCtoSensor:
					tbind._init_DCtoSensor();
					break;

				case tbind.CONSTANTS.Config.BindType_DCtoActuator:
					tbind._init_DCtoActuator();
					break;
				default:
					throw "Bad type.";
					break;
			}
		}

		/**
   * Bind DC to Sensor
   */

	}, {
		key: '_init_DCtoSensor',
		value: function _init_DCtoSensor() {}

		/**
   * Bind DC to Actuator
   */

	}, {
		key: '_init_DCtoActuator',
		value: function _init_DCtoActuator() {}

		/**
   * Start Bind
   * 
   * @param synchro Synchronization (true or false)
   * @param options Options
   */

	}, {
		key: 'start',
		value: function start(synchro, options) {

			var tbind = this;

			if (synchro == undefined) {
				synchro = true;
			}

			if (options == undefined) {
				options = [];
			}

			tbind.state = tbind.CONSTANTS.States.State_Working;

			tbind.eventEmitter.emit(tbind.CONSTANTS.Events.Bind_Started, {
				"synchro": synchro,
				"options": options
			}); // Emit event Bind_Started
		}

		/**
   * Stop Bind
   * 
   * @param synchro Synchronization (true or false)
   * @param options Options
   */

	}, {
		key: 'stop',
		value: function stop(synchro, options) {

			var tbind = this;

			if (synchro == undefined) {
				synchro = true;
			}

			if (options == undefined) {
				options = [];
			}

			tbind.state = tbind.CONSTANTS.States.State_Stop;

			tbind.eventEmitter.emit(tbind.CONSTANTS.Events.Bind_Stopped, {
				"synchro": synchro,
				"options": options
			}); // Emit event Bind_Stopped
		}

		/**
   * Unbind
   * 
   * @param synchro Synchronization (true or false)
   * @param options Options
   */

	}, {
		key: 'unbind',
		value: function unbind(synchro, options) {

			var tbind = this;

			if (synchro == undefined) {
				synchro = true;
			}

			if (options == undefined) {
				options = [];
			}

			tbind.state = tbind.CONSTANTS.States.State_Config;

			// Emit event Unbind
			tbind.eventEmitter.emit(tbind.CONSTANTS.Events.Unbind, {
				"synchro": synchro,
				"options": options
			});
		}
	}]);

	return ThingBind;
}();

/**
 * COMSystem
 */


var COMSystem = function () {
	function COMSystem(config) {
		_classCallCheck(this, COMSystem);

		this.CONSTANTS = COMSystem_CONSTANTS;
		this.version = this.CONSTANTS.Config.Version;
		this.config = config;

		this.controlChannel = null;
		this.thingsBindings = [];
	}

	_createClass(COMSystem, [{
		key: 'initialize',
		value: function initialize() {

			var comSYS = this;

			if (comSYS.config == undefined) {
				throw "Configuration is required.";
			}

			var _config = comSYS.config;

			if (_config.controlChannel == undefined) {
				throw "controlChannel is required.";
			}
		}

		/**
   * Add bind
   * 
   * @param tbind The ThingBind object
   * @param synchro Synchronization (true or false)
   * @param options Options
   */

	}, {
		key: 'addBind',
		value: function addBind(tbind, synchro, options) {

			var comSYS = this;

			var tbSearch = comSYS.getBindByID(tbind.bindID);

			if (synchro == undefined) {
				synchro = true;
			}

			if (options == undefined) {
				options = [];
			}

			if (tbSearch.tbind != null) {
				throw "Bind ID already exists.";
			}

			comSYS.thingsBindings.push(tbind);

			// Emit event Bind_Added
			comSYS.eventEmitter.emit(comSYS.CONSTANTS.Events.Bind_Added, {
				"synchro": synchro,
				"options": options,
				"bind": tbind
			});
		}

		/**
   * Get Bind searched by ID
   */

	}, {
		key: 'getBindByID',
		value: function getBindByID(bindID) {

			var comSYS = this;

			var _i = 0;
			var tbind = null;

			_i = comSYS.thingsBindings.map(function (x) {
				return x.bindID;
			}).indexOf(bindID);
			if (_i != -1) {
				tbind = comSYS.thingsBindings[_i];
			}

			return {
				"tbind": tbind,
				"position": _i
			};
		}

		/**
   * Remove Bind
   * 
   * @param tbind The ThingBind object
   * @param synchro Synchronization (true or false)
   * @param options Options
   */

	}, {
		key: 'removeBind',
		value: function removeBind(bindID, synchro, options) {

			var comSYS = this;

			if (synchro == undefined) {
				synchro = true;
			}

			if (options == undefined) {
				options = [];
			}

			var bindSearch = comSYS.getBindByID(bindID);
			if (bindSearch.tbind == null) {
				throw "Bind not found.";
			}

			var tbind = bindSearch.tbind;

			if (tbind.state != comSYS.CONSTANTS.States.State_Config) {
				throw "Bad Bind state.";
			}

			comSYS.thingsBindings.splice(bindSearch.position, 1);

			// Emit event Bind_Removed
			comSYS.eventEmitter.emit(comSYS.CONSTANTS.Events.Bind_Removed, {
				"synchro": synchro,
				"options": options,
				"bindID": bindID
			});
		}
	}], [{
		key: 'getCOMSystem',
		value: function getCOMSystem(config) {

			var COMSystem_Morse = require('./comSYS_Morse/COMsys_Morse.js').COMSystem_Morse;
			var comSYS = new COMSystem_Morse(config);
			return comSYS;
		}
	}]);

	return COMSystem;
}();

var comsystem_Lib = {
	"COMSystem_CONSTANTS": COMSystem_CONSTANTS,
	"ThingBind": ThingBind,
	"COMSystem": COMSystem
};

module.exports = comsystem_Lib;
//# sourceMappingURL=COMSystem.js.map
