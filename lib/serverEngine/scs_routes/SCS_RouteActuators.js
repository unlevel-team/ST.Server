"use strict";

let express = require('express');



/**
 * Routes for Actuators
 */
class SCS_RouteActuators {

	constructor(actuatorsManager) {
		this.expressRoute = null;
		this.messages = 0;
		this.actuatorsManager = actuatorsManager;
		
		this.mapServiceRoutes();
	}
	
	

	mapServiceRoutes() {
		
		this.expressRoute = express.Router();
		let routerActuators = this;
		
		// middleware that is specific to this router
		this.expressRoute.use(function messageCount(req, res, next) {
			 routerActuators.messages++;
			
//			res.setHeader('Content-Type', 'text/html');
//			res.write('ST Server Nodes <br />', 'utf8')
			
			 res.setHeader('Content-Type', 'application/json');
			next();
		});
		
		// define the home page route
		this.expressRoute.get('/', function(req, res) {
//			res.write('Messages received: ' + routerActuators.messages + '<br />');
//			res.end();
			let _response = {
				"context" : "ST Server Actuators",
				"action" : "Default",
				"messagesReceived" : routerActuators.messages
				
			};
			res.jsonp(_response);
			res.end();
		});
		
		// List of Actuators
		this.expressRoute.get('/list/', function(req, res) {
			
			var _response = {
				"context" : "ST Server Actuators",
				"action" : "list",
				"numberOfActuators": 0,
				"actuators" : []
			};
			
			var _i = 0;
			for (_i = 0; _i < routerActuators.actuatorsManager.actuatorsList.length; _i++) {
				let actuator = routerActuators.actuatorsManager.actuatorsList[_i];
				
				let actuatorData = {
						"actuatorID" : actuator.config.actuatorID,
						"type": actuator.config.type,
						"_sysID": actuator.config._sysID
				};
				_response.actuators.push( actuatorData );
			}
			
			_response.numberOfActuators = routerActuators.actuatorsManager.actuatorsList.length;
			
			
			res.jsonp(_response);
			res.end();
		});
		
		
		// Start Actuator
		this.expressRoute.get('/:actuatorID/start', function(req, res) {
			
			console.log(' <*> SeverControlService Actuator Start' );	// TODO REMOVE DEBUG LOG
			
			var _response = {
					"context" : "ST Server Actuators",
					"action" : "Start",
					"actuatorID": req.params.actuatorID,
					"response" : "test"
				};
			
			
			try {
				
				var actuatorSearch = routerActuators.actuatorsManager.getActuatorBy_sysID(req.params.actuatorID);
				if (actuatorSearch.stActuator != null ) {
					actuatorSearch.stActuator.start().then(function(value) {
						console.log( value );	// TODO REMOVE DEBUG LOG
						console.log(' <·> Actuator Started' );	// TODO REMOVE DEBUG LOG
					}, function(reason) {
						
					});
					
					
				} else {
					_response.response = 'Actuator not found.';
				}
				
			} catch (e) {
				// TODO: handle exception
				
				_response.response = 'Something happends...';
				_response.error = e.message;
			}
			
			
			res.jsonp(_response);
			res.end();
			
		});
		
		// Stop Actuator
		this.expressRoute.get('/:actuatorID/stop', function(req, res) {
			
			console.log(' <*> SeverControlService Actuator Stop' );	// TODO REMOVE DEBUG LOG
			
			var _response = {
					"context" : "ST Server Actuators",
					"action" : "Stop",
					"actuatorID": req.params.actuatorID,
					"response" : "test"
				};
			
			
			try {
				
				var actuatorSearch = routerActuators.actuatorsManager.getActuatorBy_sysID(req.params.actuatorID);
				if (actuatorSearch.stActuator != null ) {
					actuatorSearch.stActuator.stop().then(function(value) {
						console.log( value );	// TODO REMOVE DEBUG LOG
						console.log(' <·> Actuator Stopped' );	// TODO REMOVE DEBUG LOG
					}, function(reason) {
						console.log( reason );	// TODO REMOVE DEBUG LOG

					});
					
					
				} else {
					_response.response = 'Actuator not found.';
				}
				
			} catch (e) {
				// TODO: handle exception
				
				_response.response = 'Something happends...';
				_response.error = e.message;
			}
			
			
			res.jsonp(_response);
			res.end();
			
		});		
		
		
		
		// Turn off Actuators of Node
		this.expressRoute.get('/:nodeID/turnOffActuators', function(req, res) {
			
			console.log(' <*> SeverControlService Actuators turnOffActuators' );	// TODO REMOVE DEBUG LOG

			
			var _response = {
					"context" : "ST Server Actuators",
					"action" : "Turn off actuators",
					"sensorID": req.params.nodeID,
					"response" : "test"
				};
			
			
			try {
				
				routerActuators.actuatorsManager.turnOffActuatorsOfNode(req.params.nodeID);
				
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

module.exports = SCS_RouteActuators;
