"use strict";

let express = require('express');




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
		
		this.expressRoute = express.Router();
		let routerSensors = this;
		
		// middleware that is specific to this router
		this.expressRoute.use(function messageCount(req, res, next) {
			 routerSensors.messages++;
			
//			res.setHeader('Content-Type', 'text/html');
//			res.write('ST Server Nodes <br />', 'utf8')
			
			 res.setHeader('Content-Type', 'application/json');
			next();
		});
		
		
		// define the home page route
		this.expressRoute.get('/', function(req, res) {
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
		this.expressRoute.get('/list/', function(req, res) {
			
			var _response = {
				"context" : "ST Server Sensors",
				"action" : "List",
				"numberOfSensors": 0,
				"sensors" : []
			};
			
			var _i = 0;
			for (_i = 0; _i < routerSensors.sensorsManager.sensorList.length; _i++) {
				let sensor = routerSensors.sensorsManager.sensorList[_i];
				
				let sensorData = {
						"sensorID" : sensor.config.sensorID,
						"type": sensor.config.type,
						"_sysID": sensor.config._sysID
				};
				_response.sensors.push(sensorData);
			}
			
			_response.numberOfSensors = routerSensors.sensorsManager.sensorList.length;
			
			
			res.jsonp(_response);
			res.end();
		});
		
		
		// Start Sensor
		this.expressRoute.get('/:sensorID/start', function(req, res) {
			
			console.log(' <*> SeverControlService Sensor Start' );	// TODO REMOVE DEBUG LOG
			
			var _response = {
					"context" : "ST Server Sensors",
					"action" : "Start",
					"sensorID": req.params.sensorID,
					"response" : "test"
				};
			
			
			try {
				
				var sensorSearch = routerSensors.sensorsManager.getSensorBy_sysID(req.params.sensorID);
				if (sensorSearch.stSensor != null ) {
					sensorSearch.stSensor.start().then(function(value) {
						console.log( value );	// TODO REMOVE DEBUG LOG
						console.log(' <·> Sensor Started' );	// TODO REMOVE DEBUG LOG
					}, function(reason) {
						
					});
					
					
				} else {
					_response.response = 'Sensor not found.';
				}
				
			} catch (e) {
				// TODO: handle exception
				
				_response.response = 'Something happends...';
				_response.error = e.message;
			}
			
			
			res.jsonp(_response);
			res.end();
			
		});
		
		// Stop Sensor
		this.expressRoute.get('/:sensorID/stop', function(req, res) {
			
			console.log(' <*> SeverControlService Sensor Stop' );	// TODO REMOVE DEBUG LOG

			
			var _response = {
					"context" : "ST Server Sensors",
					"action" : "Stop",
					"sensorID": req.params.sensorID,
					"response" : "test"
				};
			
			
			try {
				
				var sensorSearch = routerSensors.sensorsManager.getSensorBy_sysID(req.params.sensorID);
				if (sensorSearch.stSensor != null ) {
					sensorSearch.stSensor.stop().then(function(value) {
						console.log( value );	// TODO REMOVE DEBUG LOG
						console.log(' <·> Sensor Stopped' );	// TODO REMOVE DEBUG LOG
					}, function(reason) {
						
					});
					
					
				} else {
					_response.response = 'Sensor not found.';
				}
				
			} catch (e) {
				// TODO: handle exception
				
				_response.response = 'Something happends...';
				_response.error = e.message;
			}
			
			
			res.jsonp(_response);
			res.end();
			
		});
		
		
		
		// Turn off Sensors of Node
		this.expressRoute.get('/:nodeID/turnOffSensors', function(req, res) {
			
			console.log(' <*> SeverControlService Sensors turnOffSensors' );	// TODO REMOVE DEBUG LOG

			
			var _response = {
					"context" : "ST Server Sensors",
					"action" : "Turn off sensors",
					"sensorID": req.params.nodeID,
					"response" : "test"
				};
			
			
			try {
				
				routerSensors.sensorsManager.turnOffSensorsOfNode(req.params.nodeID);
				
			} catch (e) {
				// TODO: handle exception
				
				_response.response = 'Something happends...';
				_response.error = e.message;
			}
			
			
			res.jsonp(_response);
			res.end();
			
		});
		
	}
}

module.exports = SCS_RouteSensors;
