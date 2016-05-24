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

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var EventEmitter = require('events').EventEmitter;

/**
 * SensorsManager CONSTANTS
 */
var SensorsManager_CONSTANTS = {
		"Config": {
				"type_Vsensor": "vsensor",
				"type_Cylonjs": "cylonjs"

		},

		"States": {
				"State_Config": "config",
				"State_Ready": "ready",
				"State_Working": "working",
				"State_Stop": "stop"
		},

		"Events": {
				"SensorRemoved": "Sensor Removed",

				"StartSensor": "StartSensor",
				"SensorStarted": "SensorStarted",
				"StopSensor": "StopSensor",
				"SensorStopped": "SensorStopped",

				"SetSensorOPsonNode": "Set SNS OPs on Node"

		},

		"Messages": {
				"getSensorsList": "Get Sensors List",
				"SensorsList": "Sensors List",
				"getSensorInfo": "Get Sensor Info",
				"SensorInfo": "Sensor Info",
				"getSensorOptions": "Get Sensor Options",
				"setSensorOptions": "Set Sensor Options",
				"SensorOptions": "Sensor Options",
				"SensorOptionsUpdated": "Sensor Options Updated",

				"StartSensor": "StartSensor",
				"SensorStarted": "SensorStarted",
				"StopSensor": "StopSensor",
				"SensorStopped": "SensorStopped",

				"TurnOffSensors": "TurnOffSensors"
		}
};

/**
 * Sensor
 */

var Sensor = function () {
		function Sensor(config) {
				_classCallCheck(this, Sensor);

				this.config = config;
				this.eventEmitter = new EventEmitter();

				this.CONSTANTS = SensorsManager_CONSTANTS;
				this.state = SensorsManager_CONSTANTS.States.State_Config;

				this.options = null;
		}

		/**
   * Initialize
   */


		_createClass(Sensor, [{
				key: "initialize",
				value: function initialize() {

						this.mapControlMessages();
						this.state = SensorsManager_CONSTANTS.States.State_Ready;
				}

				/**
     * Map control messages
     */

		}, {
				key: "mapControlMessages",
				value: function mapControlMessages() {

						var stSensor = this;

						if (stSensor.state !== stSensor.CONSTANTS.States.State_Config) {
								throw "Bad state.";
						}
				}

				/**
     * Start sensor
     */

		}, {
				key: "start",
				value: function start() {

						var stSensor = this;

						return new Promise(function (resolve, reject) {

								var request = {
										"sensorID": stSensor.config.sensorID,
										"result": null

								};

								// Emit message StartSensor
								stSensor.config._controlSocket.emit(SensorsManager_CONSTANTS.Messages.StartSensor, request);

								resolve(request);
						});
				}

				/**
     * Stop sensor
     */

		}, {
				key: "stop",
				value: function stop() {

						var stSensor = this;

						return new Promise(function (resolve, reject) {

								var request = {
										"sensorID": stSensor.config.sensorID,
										"result": null

								};

								// Emit message StopSensor
								stSensor.config._controlSocket.emit(SensorsManager_CONSTANTS.Messages.StopSensor, request);
								resolve(request);
						});
				}
		}]);

		return Sensor;
}();

/**
 * Sensors Manager
 */


var SensorsManager = function () {
		function SensorsManager() {
				_classCallCheck(this, SensorsManager);

				this.sensorList = [];
				this.eventEmitter = new EventEmitter();

				this.CONSTANTS = SensorsManager_CONSTANTS;

				this.nodeCtrlSrv = null;
		}

		/**
   * Add Sensors from Node
   */


		_createClass(SensorsManager, [{
				key: "addSensorsFromNode",
				value: function addSensorsFromNode(stNode) {

						var smngr = this;
						var _stNode = stNode;

						// · · · · · ·  # #  · · · · · ·  ###  · · · · · ·  # # · · · · · · |\/|···
						// Event NodeDisconnected
						stNode.eventEmitter.on(stNode.CONSTANTS.Events.NodeDisconnected, function (data) {

								var stSensors = smngr.getSensorsByNode(data.node.config.nodeID);

								stSensors.sensors.forEach(function (sensor, _i, _sensors) {

										var sensorSearch = smngr.getSensorBy_sysID(sensor.config._sysID);
										if (sensorSearch.stSensor !== null) {
												smngr.sensorList.splice(sensorSearch.position, 1);
										}
								});
						});
						// · · · · · ·  # #  · · · · · ·  ###  · · · · · ·  # # · · · · · · |/\|···

						// Map event disconnect
						stNode.socket.on("disconnect", function () {
								stNode.socket.removeAllListeners(smngr.CONSTANTS.Messages.SensorStarted);
								stNode.socket.removeAllListeners(smngr.CONSTANTS.Messages.SensorStopped);
								stNode.socket.removeAllListeners(smngr.CONSTANTS.Messages.SensorsList);
								stNode.socket.removeAllListeners(smngr.CONSTANTS.Messages.SensorOptions);
								stNode.socket.removeAllListeners(smngr.CONSTANTS.Messages.SensorOptionsUpdated);
						});

						// Map message SensorStarted
						stNode.socket.on(smngr.CONSTANTS.Messages.SensorStarted, function (msg) {

								var stSensors = smngr.getSensorBy_sysID(stNode.config.nodeID + msg.sensorID);
								if (stSensors.stSensor === null) {
										throw "Sensor not found.";
								}

								var stSensor = stSensors.stSensor;

								stSensor.eventEmitter.emit(SensorsManager_CONSTANTS.Events.SensorStarted);
						});

						// Map message SensorStopped
						stNode.socket.on(smngr.CONSTANTS.Messages.SensorStopped, function (msg) {

								var stSensors = smngr.getSensorBy_sysID(stNode.config.nodeID + msg.sensorID);
								if (stSensors.stSensor === null) {
										throw "Sensor not found.";
								}

								var stSensor = stSensors.stSensor;

								stSensor.eventEmitter.emit(SensorsManager_CONSTANTS.Events.SensorStopped);
						});

						// Map Message SensorsList
						stNode.socket.on(smngr.CONSTANTS.Messages.SensorsList, function (msg) {

								smngr._msg_SensorsList(msg, stNode, { "data": msg });
						});

						// Map message SensorOptions
						stNode.socket.on(smngr.CONSTANTS.Messages.SensorOptions, function (msg) {

								smngr._msg_SensorOptions(msg, stNode, {
										"sensorID": msg.sensorID,
										"options": msg.options
								});
						});

						// Map message SensorOptions
						stNode.socket.on(smngr.CONSTANTS.Messages.SensorOptionsUpdated, function (msg) {

								smngr._msg_SensorOptionsUpdated(msg, stNode, {
										"sensorID": msg.sensorID
								});
						});

						if (stNode.config.numSensors > 0) {

								// Emit message getSensorsList
								stNode.socket.emit(smngr.CONSTANTS.Messages.getSensorsList);
						}
				}

				/**
     * Add Sensor
     */

		}, {
				key: "addSensor",
				value: function addSensor(config) {

						var smngr = this;

						var stSensor = new Sensor(config);

						var controlSocket = stSensor.config._controlSocket;

						// · · · · · ·  # #  · · · · · ·  ###  · · · · · ·  # # · · · · · · |\/|···
						// Event SensorStarted
						stSensor.eventEmitter.on(SensorsManager_CONSTANTS.Events.SensorStarted, function () {

								console.log('<···> ST SensorsManager.SensorStarted'); // TODO REMOVE DEBUG LOG
								console.log(' <···> ' + stSensor.config.id); // TODO REMOVE DEBUG LOG
						});
						// · · · · · ·  # #  · · · · · ·  ###  · · · · · ·  # # · · · · · · |/\|···

						// · · · · · ·  # #  · · · · · ·  ###  · · · · · ·  # # · · · · · · |\/|···
						// Event SensorStopped
						stSensor.eventEmitter.on(SensorsManager_CONSTANTS.Events.SensorStopped, function () {

								console.log('<···> ST SensorsManager.SensorStopped'); // TODO REMOVE DEBUG LOG
								console.log(' <···> ' + stSensor.config.id); // TODO REMOVE DEBUG LOG
						});
						// · · · · · ·  # #  · · · · · ·  ###  · · · · · ·  # # · · · · · · |/\|···

						stSensor.initialize();
						smngr.sensorList.push(stSensor);

						// Emit message getSensorOptions
						controlSocket.emit(smngr.CONSTANTS.Messages.getSensorOptions, { "sensorID": stSensor.config.sensorID }); // Emit message getSensorOptions
				}

				/**
     * Returns Sensor searched by ID
     */

		}, {
				key: "getSensorBy_sysID",
				value: function getSensorBy_sysID(sensorID) {

						var smngr = this;

						var sensor = null;
						var _i = 0;

						_i = smngr.sensorList.map(function (x) {
								return x.config._sysID;
						}).indexOf(sensorID);
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

		}, {
				key: "getSensorsByNode",
				value: function getSensorsByNode(nodeID) {

						var smngr = this;

						var sensors = smngr.sensorList.filter(function (sensor, _i, _sensors) {

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

		}, {
				key: "turnOffSensorsOfNode",
				value: function turnOffSensorsOfNode(nodeID) {

						var smngr = this;
						//		let _nodeID = nodeID;

						console.log('<*> ST SensorsManager.turnOffSensorsOfNode'); // TODO REMOVE DEBUG LOG
						console.log(nodeID); // TODO REMOVE DEBUG LOG

						var sensorsSearch = smngr.getSensorsByNode(nodeID);

						if (sensorsSearch.sensors !== null) {
								console.log(' <·> Emit message'); // TODO REMOVE DEBUG LOG
								sensorsSearch.sensors[0].config._controlSocket.emit(smngr.CONSTANTS.Messages.TurnOffSensors);
						} else {
								console.log(' <·> Node not found!!!'); // TODO REMOVE DEBUG LOG
						}
				}

				/**
     * Get options of sensor
     */

		}, {
				key: "getOptionsOfSensor",
				value: function getOptionsOfSensor(sns) {

						var smngr = this;
						var controlSocket = sns.config._controlSocket;

						console.log('<*> ST SensorsManager.getOptionsOfSensor'); // TODO REMOVE DEBUG LOG

						controlSocket.emit(smngr.CONSTANTS.Messages.getSensorOptions, { "sensorID": sns.config.sensorID }); // Emit message getSensorOptions
				}

				/**
     * Set options of sensor
     */

		}, {
				key: "setOptionsOfSensor",
				value: function setOptionsOfSensor(sns, options) {

						var smngr = this;
						var controlSocket = sns.config._controlSocket;

						console.log('<*> ST SensorsManager.setOptionsOfSensor'); // TODO REMOVE DEBUG LOG
						console.log(options); // TODO REMOVE DEBUG LOG

						controlSocket.emit(smngr.CONSTANTS.Messages.setSensorOptions, { "sensorID": sns.config.sensorID, "options": options }); // Emit message setSensorOptions
				}

				/**
     * Message SensorList
     */

		}, {
				key: "_msg_SensorsList",
				value: function _msg_SensorsList(msg, stNode, options) {

						var smngr = this;
						var controlSocket = stNode.socket;
						var data = options.data;

						if (data.numSensors > 0) {

								data.sensors.forEach(function (snsDATA, _i) {

										snsDATA._sysID = stNode.config.nodeID + '.' + snsDATA.sensorID;
										snsDATA._refSTNodeID = stNode.config.nodeID;

										snsDATA._stNodeEvents = stNode.eventEmitter;
										snsDATA._controlSocket = controlSocket;

										smngr.addSensor(snsDATA);
								});
						}
				}

				/**
     * Message SensorOptions
     */

		}, {
				key: "_msg_SensorOptions",
				value: function _msg_SensorOptions(msg, stNode, options) {

						var smngr = this;

						var sensorID = options.sensorID;
						var sensorOptions = options.options;

						var sensor_sysID = stNode.config.nodeID + '.' + sensorID;

						var response = {
								"sensorID": sensorID
						};

						console.log('<*> ST SensorsManager._msg_SensorOptions'); // TODO REMOVE DEBUG LOG
						console.log(msg); // TODO REMOVE DEBUG LOG

						try {

								var sensorSearch = smngr.getSensorBy_sysID(sensor_sysID);
								if (sensorSearch.stSensor === null) {
										throw "Sensor not found";
								}

								var sns = sensorSearch.stSensor;

								sns.options = sensorOptions;
						} catch (e) {
								// TODO: handle exception
								response.result = "ERROR";
								response.error = e;

								console.log('<EEE> SensorsManager._msg_SensorOptions ERROR'); // TODO REMOVE DEBUG LOG
								console.log(response); // TODO REMOVE DEBUG LOG
						}
				}

				/**
     * Message SensorOptionsUpdated
     */

		}, {
				key: "_msg_SensorOptionsUpdated",
				value: function _msg_SensorOptionsUpdated(msg, stNode, options) {

						var smngr = this;

						var sensorID = options.sensorID;
						var controlSocket = stNode.socket;

						var sensor_sysID = stNode.config.nodeID + '.' + sensorID;

						var response = {
								"sensorID": sensorID
						};

						console.log('<*> ST SensorsManager.SensorOptionsUpdated'); // TODO REMOVE DEBUG LOG
						console.log(options); // TODO REMOVE DEBUG LOG

						try {

								var sensorSearch = smngr.getSensorBy_sysID(sensor_sysID);
								if (sensorSearch.stSensor === null) {
										throw "Sensor not found";
								}

								var sns = sensorSearch.stSensor;

								smngr.getOptionsOfSensor(sns);
						} catch (e) {
								// TODO: handle exception
								response.result = "ERROR";
								response.error = e;

								console.log('<EEE> SensorsManager._msg_SensorOptionsUpdated ERROR'); // TODO REMOVE DEBUG LOG
								console.log(response); // TODO REMOVE DEBUG LOG
						}
				}
		}]);

		return SensorsManager;
}();

module.exports = SensorsManager;
//# sourceMappingURL=SensorsManager.js.map
