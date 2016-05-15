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

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var EventEmitter = require('events').EventEmitter;

/**
 * ActuatorsManager CONSTANTS
 */
var ActuatorsManager_CONSTANTS = {
	"Config": {
		"type_Vactuator": "vactuator",
		"type_Cylonjs": "cylonjs"

	},

	"States": {
		"State_Config": "config",
		"State_Ready": "ready",
		"State_Working": "working",
		"State_Stop": "stop"
	},

	"Events": {
		"ActuatorRemoved": "Actuator Removed",

		"StartActuator": "StartActuator",
		"ActuatorStarted": "ActuatorStarted",
		"StopActuator": "StopActuator",
		"ActuatorStopped": "ActuatorStopped"
	},

	"Messages": {
		"getActuatorsList": "Get Actuators List",
		"ActuatorsList": "Actuators List",
		"getActuatorInfo": "Get Actuator Info",
		"ActuatorInfo": "Actuator Info",
		"getActuatorOptions": "Get Actuator Options",
		"setActuatorOptions": "Set Actuator Options",
		"ActuatorOptions": "Actuator Options",
		"ActuatorOptionsUpdated": "Actuator Options Updated",

		"StartActuator": "StartActuator",
		"ActuatorStarted": "ActuatorStarted",
		"StopActuator": "StopActuator",
		"ActuatorStopped": "ActuatorStopped",

		"TurnOffActuators": "TurnOffActuators"
	}
};

/**
 * Actuator
 */

var Actuator = function () {
	function Actuator(config) {
		_classCallCheck(this, Actuator);

		this.config = config;
		this.eventEmitter = new EventEmitter();

		this.CONSTANTS = ActuatorsManager_CONSTANTS;
		this.state = ActuatorsManager_CONSTANTS.States.State_Config;

		this.options = null;
	}

	/**
  * Initialize
  */


	_createClass(Actuator, [{
		key: "initialize",
		value: function initialize() {

			this.mapControlMessages();
			this.state = ActuatorsManager_CONSTANTS.States.State_Ready;
		}

		/**
   * Map control messages
   */

	}, {
		key: "mapControlMessages",
		value: function mapControlMessages() {

			var stActuator = this;

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

	}, {
		key: "start",
		value: function start() {

			var stActuator = this;

			return new Promise(function (resolve, reject) {

				var request = {
					"actuatorID": stActuator.config.actuatorID,
					"result": null

				};

				stActuator.config._controlSocket.emit(stActuator.CONSTANTS.Messages.StartActuator, request);

				resolve(request);
			});
		}

		/**
   * Stop actuator
   */

	}, {
		key: "stop",
		value: function stop() {

			var stActuator = this;

			return new Promise(function (resolve, reject) {

				var request = {
					"actuatorID": stActuator.config.actuatorID,
					"result": null

				};

				stActuator.config._controlSocket.emit(stActuator.CONSTANTS.Messages.StopActuator, request);
				resolve(request);
			});
		}
	}]);

	return Actuator;
}();

/**
 * ActuatorsManager
 */


var ActuatorsManager = function () {
	function ActuatorsManager() {
		_classCallCheck(this, ActuatorsManager);

		this.actuatorsList = [];
		this.eventEmitter = new EventEmitter();

		this.CONSTANTS = ActuatorsManager_CONSTANTS;

		this.nodeCtrlSrv = null;
	}

	/**
  * Add Actuators from Node
  */


	_createClass(ActuatorsManager, [{
		key: "addActuatorsFromNode",
		value: function addActuatorsFromNode(stNode) {

			var amngr = this;
			var _stNode = stNode;

			// · · · · · ·  # #  · · · · · ·  ###  · · · · · ·  # # · · · · · · |\/|··· 
			// Event NodeDisconnected
			stNode.eventEmitter.on(stNode.CONSTANTS.Events.NodeDisconnected, function (data) {

				var stActuators = amngr.getActuatorsByNode(data.node.config.nodeID);

				stActuators.actuators.forEach(function (actuator, _i, _actuators) {

					var actuatorSearch = amngr.getActuatorBy_sysID(actuator.config._sysID);
					if (actuatorSearch.stActuator != null) {
						amngr.actuatorsList.splice(actuatorSearch.position, 1);
					}
				});
			});
			// · · · · · ·  # #  · · · · · ·  ###  · · · · · ·  # # · · · · · · |/\|··· 

			// Map event disconnect
			stNode.socket.on("disconnect", function () {
				stNode.socket.removeAllListeners(amngr.CONSTANTS.Messages.ActuatorStarted);
				stNode.socket.removeAllListeners(amngr.CONSTANTS.Messages.ActuatorStopped);
				stNode.socket.removeAllListeners(amngr.CONSTANTS.Messages.ActuatorOptions);
				stNode.socket.removeAllListeners(amngr.CONSTANTS.Messages.ActuatorOptionsUpdated);
				stNode.socket.removeAllListeners(amngr.CONSTANTS.Messages.ActuatorsList);
			});

			// Map Message ActuatorStarted
			stNode.socket.on(amngr.CONSTANTS.Messages.ActuatorStarted, function (msg) {
				amngr.eventEmitter.emit(amngr.CONSTANTS.Events.ActuatorStarted); // Emit event ActuatorStarted
			});

			// Map Message ActuatorStopped
			stNode.socket.on(amngr.CONSTANTS.Messages.ActuatorStopped, function (msg) {
				amngr.eventEmitter.emit(amngr.CONSTANTS.Events.ActuatorStopped); // Emit event ActuatorStopped
			});

			// Map Message ActuatorOptions
			stNode.socket.on(amngr.CONSTANTS.Messages.ActuatorOptions, function (msg) {

				amngr._msg_ActuatorOptions(msg, stNode, { "actuatorID": msg.actuatorID,
					"options": msg.options
				});
			});

			// Map Message ActuatorOptionsUpdated
			stNode.socket.on(amngr.CONSTANTS.Messages.ActuatorOptionsUpdated, function (msg) {

				amngr._msg_ActuatorOptionsUpdated(msg, stNode, { "actuatorID": msg.actuatorID });
			});

			// Map Message ActuatorsList
			stNode.socket.on(amngr.CONSTANTS.Messages.ActuatorsList, function (data) {

				amngr._msg_ActuatorsList(data, stNode, { "data": data });
			});

			if (stNode.config.numActuators > 0) {
				stNode.socket.emit(amngr.CONSTANTS.Messages.getActuatorsList);
			}
		}

		/**
   * Add Actuator
   */

	}, {
		key: "addActuator",
		value: function addActuator(config) {

			var amngr = this;
			var stActuator = new Actuator(config);

			var controlSocket = stActuator.config._controlSocket;

			// · · · · · ·  # #  · · · · · ·  ###  · · · · · ·  # # · · · · · · |\/|··· 
			// Event ActuatorStarted
			stActuator.eventEmitter.on(ActuatorsManager_CONSTANTS.Events.ActuatorStarted, function () {

				console.log('<···> ST ActuatorsManager.ActuatorStarted'); // TODO REMOVE DEBUG LOG
				console.log(' <···> ' + stActuator.config.id); // TODO REMOVE DEBUG LOG
			});
			// · · · · · ·  # #  · · · · · ·  ###  · · · · · ·  # # · · · · · · |/\|··· 

			// · · · · · ·  # #  · · · · · ·  ###  · · · · · ·  # # · · · · · · |\/|··· 
			// Event ActuatorStopped
			stActuator.eventEmitter.on(ActuatorsManager_CONSTANTS.Events.ActuatorStopped, function () {

				console.log('<···> ST ActuatorsManager.ActuatorStopped'); // TODO REMOVE DEBUG LOG
				console.log(' <···> ' + stActuator.config.id); // TODO REMOVE DEBUG LOG
			});
			// · · · · · ·  # #  · · · · · ·  ###  · · · · · ·  # # · · · · · · |/\|··· 

			stActuator.initialize();
			amngr.actuatorsList.push(stActuator);

			controlSocket.emit(amngr.CONSTANTS.Messages.getActuatorOptions, { "actuatorID": stActuator.config.actuatorID }); // Emit message getActuatorOptions
		}

		/**
   * Returns Actuator searched by ID
   */

	}, {
		key: "getActuatorBy_sysID",
		value: function getActuatorBy_sysID(actuatorID) {

			var amngr = this;
			var actuator = null;
			var _i = 0;

			for (_i = 0; _i < amngr.actuatorsList.length; _i++) {
				if (amngr.actuatorsList[_i].config._sysID == actuatorID) {
					actuator = amngr.actuatorsList[_i];
					break;
				}
			}

			return {
				"stActuator": actuator,
				"position": _i
			};
		}

		/**
   * Returns Actuators searched by Node.ID
   */

	}, {
		key: "getActuatorsByNode",
		value: function getActuatorsByNode(nodeID) {

			var amngr = this;

			var actuators = amngr.actuatorsList.filter(function (actuator, _i, _actuators) {

				if (actuator.config._refSTNodeID == nodeID) {
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

	}, {
		key: "turnOffActuatorsOfNode",
		value: function turnOffActuatorsOfNode(nodeID) {

			var amngr = this;
			//		let _nodeID = nodeID;

			console.log('<*> ST ActuatorsManager.turnOffActuatorsOfNode'); // TODO REMOVE DEBUG LOG
			console.log(nodeID); // TODO REMOVE DEBUG LOG

			var actuatorsSearch = amngr.getActuatorsByNode(nodeID);

			if (actuatorsSearch.actuators != null) {
				console.log(' <·> Emit message'); // TODO REMOVE DEBUG LOG
				actuatorsSearch.actuators[0].config._controlSocket.emit(amngr.CONSTANTS.Messages.TurnOffActuators);
			} else {
				console.log(' <·> Node not found!!!'); // TODO REMOVE DEBUG LOG
			}
		}

		/**
   * Get options of actuator
   */

	}, {
		key: "getOptionsOfActuator",
		value: function getOptionsOfActuator(act) {

			var amngr = this;
			var controlSocket = act.config._controlSocket;

			console.log('<*> ST ActuatorsManager.getOptionsOfActuator'); // TODO REMOVE DEBUG LOG

			controlSocket.emit(smngr.CONSTANTS.Messages.getActuatorOptions, { "actuatorID": act.config.actuatorID }); // Emit message getActuatorOptions
		}

		/**
   * Set options of actuator
   */

	}, {
		key: "setOptionsOfActuator",
		value: function setOptionsOfActuator(act, options) {

			var amngr = this;
			var controlSocket = act.config._controlSocket;

			console.log('<*> ST ActuatorsManager.setOptionsOfActuator'); // TODO REMOVE DEBUG LOG
			console.log(options); // TODO REMOVE DEBUG LOG

			controlSocket.emit(amngr.CONSTANTS.Messages.setActuatorOptions, { "actuatorID": act.config.actuatorID, "options": options }); // Emit message setSensorOptions
		}

		/**
   * Message ActuatorsList
   */

	}, {
		key: "_msg_ActuatorsList",
		value: function _msg_ActuatorsList(msg, stNode, options) {

			var amngr = this;
			var controlSocket = stNode.socket;
			var data = options.data;

			if (data.numActuators > 0) {

				data.actuators.forEach(function (act, _i) {

					act._sysID = stNode.config.nodeID + '.' + act.actuatorID;
					act._refSTNode = stNode;
					act._refSTNodeID = stNode.config.nodeID;
					act._stNodeEvents = stNode.eventEmitter;
					act._controlSocket = controlSocket;

					amngr.addActuator(act);
				});
			}
		}

		/**
   * Message ActuatorOptions
   */

	}, {
		key: "_msg_ActuatorOptions",
		value: function _msg_ActuatorOptions(msg, stNode, options) {

			var amngr = this;
			var controlSocket = stNode.socket;

			console.log('<*> ST ActuatorsManager._msg_ActuatorOptions'); // TODO REMOVE DEBUG LOG
			console.log(options); // TODO REMOVE DEBUG LOG

			var actuatorID = options.actuatorID;
			var actuatorOptions = options.options;

			var actuator_sysID = stNode.config.nodeID + '.' + actuatorID;

			var response = {
				"actuatorID": actuatorID
			};

			try {

				var actuatorSearch = amngr.getActuatorBy_sysID(actuator_sysID);
				if (actuatorSearch.stActuator == null) {
					throw "Sensor not found";
				}

				var act = actuatorSearch.stActuator;

				act.options = actuatorOptions;
			} catch (e) {
				// TODO: handle exception
				response.result = "ERROR";
				response.error = e;

				console.log('<EEE> NodesNetManager._msg_ActuatorOptions ERROR'); // TODO REMOVE DEBUG LOG
				console.log(response); // TODO REMOVE DEBUG LOG
			}
		}

		/**
   * Message ActuatorOptionsUpdated
   */

	}, {
		key: "_msg_ActuatorOptionsUpdated",
		value: function _msg_ActuatorOptionsUpdated(msg, stNode, options) {

			var amngr = this;

			var actuatorID = options.actuatorID;
			var controlSocket = stNode.socket;

			var actuator_sysID = stNode.config.nodeID + '.' + actuatorID;

			var response = {
				"actuatorID": actuatorID
			};

			console.log('<*> ST ActuatorsManager.ActuatorOptionsUpdated'); // TODO REMOVE DEBUG LOG
			console.log(msg); // TODO REMOVE DEBUG LOG

			try {

				var actuatorSearch = amngr.getActuatorBy_sysID(actuator_sysID);
				if (actuatorSearch.stActuator == null) {
					throw "Actuator not found";
				}

				var act = actuatorSearch.stActuator;

				amngr.getOptionsOfActuator(act);
			} catch (e) {
				// TODO: handle exception
				response.result = "ERROR";
				response.error = e;

				console.log('<EEE> ActuatorsManager._msg_ActuatorOptionsUpdated ERROR'); // TODO REMOVE DEBUG LOG
				console.log(response); // TODO REMOVE DEBUG LOG
			}
		}
	}]);

	return ActuatorsManager;
}();

module.exports = ActuatorsManager;
//# sourceMappingURL=ActuatorsManager.js.map
