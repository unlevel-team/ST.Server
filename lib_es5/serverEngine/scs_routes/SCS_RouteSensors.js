"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var express = require('express');

var bodyParser = require('body-parser');

/**
 * Routes for Sensors
 */

var SCS_RouteSensors = function () {
	function SCS_RouteSensors(sensorsManager) {
		_classCallCheck(this, SCS_RouteSensors);

		this.expressRoute = null;
		this.messages = 0;
		this.sensorsManager = sensorsManager;

		this.mapServiceRoutes();
	}

	_createClass(SCS_RouteSensors, [{
		key: 'mapServiceRoutes',
		value: function mapServiceRoutes() {

			var routerSensors = this;
			routerSensors.expressRoute = express.Router();

			// create application/json parser
			var jsonParser = bodyParser.json();

			// middleware that is specific to this router
			routerSensors.expressRoute.use(function messageCount(req, res, next) {
				routerSensors.messages++;

				//			res.setHeader('Content-Type', 'text/html');
				//			res.write('ST Server Nodes <br />', 'utf8')

				res.setHeader('Content-Type', 'application/json');
				next();
			});

			// define the home page route
			routerSensors.expressRoute.get('/', function (req, res) {
				//			res.write('Messages received: ' + routerNodes.messages + '<br />');
				//			res.end();
				var _response = {
					"context": "ST Server Sensors",
					"action": "Default",
					"messagesReceived": routerSensors.messages

				};
				res.jsonp(_response);
				res.end();
			});

			// List of Sensors
			routerSensors.expressRoute.get('/list/', function (req, res) {

				var smngr = routerSensors.sensorsManager;

				var _response = {
					"context": "ST Server Sensors",
					"action": "List",
					"numberOfSensors": 0,
					"sensors": []
				};

				smngr.sensorList.forEach(function (sns_, _i) {
					var sensorData = {
						"sensorID": sns_.config.sensorID,
						"type": sns_.config.type,
						"_sysID": sns_.config._sysID
					};
					_response.sensors.push(sensorData);
				});

				_response.numberOfSensors = routerSensors.sensorsManager.sensorList.length;

				res.jsonp(_response);
				res.end();
			});

			// Get Sensor options
			routerSensors.expressRoute.get('/:sensorID/options', function (req, res) {

				console.log(' <*> SeverControlService Get Sensor Options'); // TODO REMOVE DEBUG LOG

				var smngr = routerSensors.sensorsManager;
				var sensorID = req.params.sensorID;

				var _response = {
					"context": "ST Server Sensors",
					"action": "Get Options of Sensor",
					"sensorID": sensorID
				};

				try {

					var sensorSearch = smngr.getSensorBy_sysID(sensorID);
					if (sensorSearch.stSensor === null) {
						throw "Sensor not found";
					}

					var stSensor = sensorSearch.stSensor;

					_response.options = stSensor.options;
				} catch (e) {
					// TODO: handle exception

					_response.response = 'Something happends...';
					_response.error = e;
				}

				res.jsonp(_response);
				res.end();
			});

			// Set Sensor options
			routerSensors.expressRoute.post('/:sensorID/options', jsonParser, function (req, res) {

				console.log(' <*> SeverControlService Set Sensor Options'); // TODO REMOVE DEBUG LOG

				var smngr = routerSensors.sensorsManager;
				var sensorID = req.params.sensorID;

				var options = req.body.options;

				var _response = {
					"context": "ST Server Sensors",
					"action": "Set Options of Sensor",
					"sensorID": sensorID,
					"options": options
				};

				try {

					var sensorSearch = smngr.getSensorBy_sysID(sensorID);
					if (sensorSearch.stSensor === null) {
						throw "Sensor not found";
					}

					var stSensor = sensorSearch.stSensor;

					smngr.setOptionsOfSensor(stSensor, options);
				} catch (e) {
					// TODO: handle exception

					_response.response = 'Something happends...';
					_response.error = e;
				}

				res.jsonp(_response);
				res.end();
			});

			// Start Sensor
			routerSensors.expressRoute.get('/:sensorID/start', function (req, res) {

				console.log(' <*> SeverControlService Sensor Start'); // TODO REMOVE DEBUG LOG

				var smngr = routerSensors.sensorsManager;
				var sensorID = req.params.sensorID;

				var _response = {
					"context": "ST Server Sensors",
					"action": "Start",
					"sensorID": sensorID,
					"response": "test"
				};

				try {

					var sensorSearch = smngr.getSensorBy_sysID(sensorID);
					if (sensorSearch.stSensor !== null) {
						sensorSearch.stSensor.start().then(function (value) {
							console.log(value); // TODO REMOVE DEBUG LOG
							console.log(' <*> Sensor Started'); // TODO REMOVE DEBUG LOG
						}, function (reason) {});
					} else {
						_response.response = 'Sensor not found.';
					}
				} catch (e) {
					// TODO: handle exception

					_response.response = 'Something happends...';
					_response.error = e;
				}

				res.jsonp(_response);
				res.end();
			});

			// Stop Sensor
			routerSensors.expressRoute.get('/:sensorID/stop', function (req, res) {

				console.log(' <*> SeverControlService Sensor Stop'); // TODO REMOVE DEBUG LOG

				var smngr = routerSensors.sensorsManager;
				var sensorID = req.params.sensorID;

				var _response = {
					"context": "ST Server Sensors",
					"action": "Stop",
					"sensorID": sensorID,
					"response": "test"
				};

				try {

					var sensorSearch = smngr.getSensorBy_sysID(sensorID);
					if (sensorSearch.stSensor !== null) {
						sensorSearch.stSensor.stop().then(function (value) {
							console.log(value); // TODO REMOVE DEBUG LOG
							console.log(' <*> Sensor Stopped'); // TODO REMOVE DEBUG LOG
						}, function (reason) {});
					} else {
						_response.response = 'Sensor not found.';
					}
				} catch (e) {
					// TODO: handle exception

					_response.response = 'Something happends...';
					_response.error = e;
				}

				res.jsonp(_response);
				res.end();
			});

			// Turn off Sensors of Node
			routerSensors.expressRoute.get('/:nodeID/turnOffSensors', function (req, res) {

				console.log(' <*> SeverControlService Sensors turnOffSensors'); // TODO REMOVE DEBUG LOG

				var smngr = routerSensors.sensorsManager;
				var nodeID = req.params.nodeID;

				var _response = {
					"context": "ST Server Sensors",
					"action": "Turn off sensors",
					"sensorID": nodeID,
					"response": "test"
				};

				try {
					smngr.turnOffSensorsOfNode(nodeID);
				} catch (e) {
					// TODO: handle exception
					_response.response = 'Something happends...';
					_response.error = e;
				}

				res.jsonp(_response);
				res.end();
			});
		}
	}]);

	return SCS_RouteSensors;
}();

module.exports = SCS_RouteSensors;
//# sourceMappingURL=SCS_RouteSensors.js.map
