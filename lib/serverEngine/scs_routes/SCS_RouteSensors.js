"use strict";

let express = require('express');

let bodyParser = require('body-parser');


/**
 * Routes for Sensors
 */
class SCS_RouteSensors {

	constructor(sensorsManager) {
		this.expressRoute = null;
		this.messages = 0;
		this.sensorsManager = sensorsManager;
		
		
		this.mapServiceRoutes();
	}
	
	
	mapServiceRoutes() {
		
		let routerSensors = this;
		routerSensors.expressRoute = express.Router();
		
		// create application/json parser 
		let jsonParser = bodyParser.json();
		
		// middleware that is specific to this router
		routerSensors.expressRoute.use(function messageCount(req, res, next) {
			 routerSensors.messages++;
			
//			res.setHeader('Content-Type', 'text/html');
//			res.write('ST Server Nodes <br />', 'utf8')
			
			 res.setHeader('Content-Type', 'application/json');
			next();
		});
		
		
		// define the home page route
		routerSensors.expressRoute.get('/', function(req, res) {
//			res.write('Messages received: ' + routerNodes.messages + '<br />');
//			res.end();
			let _response = {
				"context" : "ST Server Sensors",
				"action" : "Default",
				"messagesReceived" : routerSensors.messages
				
			};
			res.jsonp(_response);
			res.end();
		});
		
		
		// List of Sensors
		routerSensors.expressRoute.get('/list/', function(req, res) {
			
			let smngr = routerSensors.sensorsManager;
			
			var _response = {
				"context" : "ST Server Sensors",
				"action" : "List",
				"numberOfSensors": 0,
				"sensors" : []
			};
			
			
			smngr.sensorList.forEach(function(sns_, _i) {
				let sensorData = {
						"sensorID" : sns_.config.sensorID,
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
		routerSensors.expressRoute.get('/:sensorID/options', function(req, res) {
			
			console.log(' <*> SeverControlService Get Sensor Options' );	// TODO REMOVE DEBUG LOG

			let smngr = routerSensors.sensorsManager;
			let sensorID = req.params.sensorID;
			
			let _response = {
					"context" : "ST Server Sensors",
					"action" : "Get Options of Sensor",
					"sensorID": sensorID
				};
			
			try {
				
				let sensorSearch = smngr.getSensorBy_sysID(sensorID);
				if (sensorSearch.stSensor === null ) {
					throw "Sensor not found";
				}
				
				let stSensor = sensorSearch.stSensor;
				
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
		routerSensors.expressRoute.post('/:sensorID/options', jsonParser, function(req, res) {
			
			console.log(' <*> SeverControlService Set Sensor Options' );	// TODO REMOVE DEBUG LOG

			let smngr = routerSensors.sensorsManager;
			let sensorID = req.params.sensorID;
			
			let options = req.body.options;
			
			let _response = {
					"context" : "ST Server Sensors",
					"action" : "Set Options of Sensor",
					"sensorID": sensorID,
					"options": options
				};
			
			try {
				
				let sensorSearch = smngr.getSensorBy_sysID(sensorID);
				if (sensorSearch.stSensor === null ) {
					throw "Sensor not found";
				}
				
				let stSensor = sensorSearch.stSensor;
				
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
		routerSensors.expressRoute.get('/:sensorID/start', function(req, res) {
			
			console.log(' <*> SeverControlService Sensor Start' );	// TODO REMOVE DEBUG LOG
			
			let smngr = routerSensors.sensorsManager;
			let sensorID = req.params.sensorID;
			
			let _response = {
					"context" : "ST Server Sensors",
					"action" : "Start",
					"sensorID": sensorID,
					"response" : "test"
				};
			
			
			try {
				
				let sensorSearch = smngr.getSensorBy_sysID(sensorID);
				if (sensorSearch.stSensor !== null ) {
					sensorSearch.stSensor.start().then(function(value) {
						console.log( value );	// TODO REMOVE DEBUG LOG
						console.log(' <*> Sensor Started' );	// TODO REMOVE DEBUG LOG
					}, function(reason) {
						
					});
					
					
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
		routerSensors.expressRoute.get('/:sensorID/stop', function(req, res) {
			
			console.log(' <*> SeverControlService Sensor Stop' );	// TODO REMOVE DEBUG LOG

			let smngr = routerSensors.sensorsManager;
			let sensorID = req.params.sensorID;
			
			let _response = {
					"context" : "ST Server Sensors",
					"action" : "Stop",
					"sensorID": sensorID,
					"response" : "test"
				};
			
			
			try {
				
				let sensorSearch = smngr.getSensorBy_sysID(sensorID);
				if (sensorSearch.stSensor !== null ) {
					sensorSearch.stSensor.stop().then(function(value) {
						console.log( value );	// TODO REMOVE DEBUG LOG
						console.log(' <*> Sensor Stopped' );	// TODO REMOVE DEBUG LOG
					}, function(reason) {
						
					});
					
					
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
		routerSensors.expressRoute.get('/:nodeID/turnOffSensors', function(req, res) {
			
			console.log(' <*> SeverControlService Sensors turnOffSensors' );	// TODO REMOVE DEBUG LOG

			let smngr = routerSensors.sensorsManager;
			let nodeID = req.params.nodeID;
			
			var _response = {
					"context" : "ST Server Sensors",
					"action" : "Turn off sensors",
					"sensorID": nodeID,
					"response" : "test"
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
}

module.exports = SCS_RouteSensors;
