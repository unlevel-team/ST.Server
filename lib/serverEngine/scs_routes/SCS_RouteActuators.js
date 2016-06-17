"use strict";

let express = require('express');

let bodyParser = require('body-parser');


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
		
		let routerActuators = this;

		routerActuators.expressRoute = express.Router();
		
		// create application/json parser 
		let jsonParser = bodyParser.json();
		
		// middleware that is specific to this router
		routerActuators.expressRoute.use(function messageCount(req, res, next) {
			 routerActuators.messages++;
			
//			res.setHeader('Content-Type', 'text/html');
//			res.write('ST Server Nodes <br />', 'utf8')
			
			 res.setHeader('Content-Type', 'application/json');
			next();
		});
		
		// define the home page route
		routerActuators.expressRoute.get('/', function(req, res) {
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
		routerActuators.expressRoute.get('/list/', function(req, res) {
			
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
		
		
		
		// Get Actuator options
		routerActuators.expressRoute.get('/:actuatorID/options', function(req, res) {
			
			console.log(' <*> SeverControlService Get Actuator Options' );	// TODO REMOVE DEBUG LOG

			let amngr = routerActuators.actuatorsManager;
			let actuatorID = req.params.actuatorID;
			
			let _response = {
					"context" : "ST Server Actuators",
					"action" : "Get Options of Actuator",
					"actuatorID": actuatorID
				};
			
			try {
				
				let actuatorSearch = amngr.getActuatorBy_sysID(actuatorID);
				if (actuatorSearch.stActuator === null ) {
					throw "Actuator not found";
				}
				
				let stActuator = actuatorSearch.stActuator;
				
				_response.options = stActuator.options;
				
				
			} catch (e) {
				// TODO: handle exception
				
				_response.response = 'Something happends...';
				_response.error = e;
			}
			
			
			res.jsonp(_response);
			res.end();
			
		});
		
		
		
		// Set Actuator options
		routerActuators.expressRoute.post('/:actuatorID/options', jsonParser, function(req, res) {
			
			console.log(' <*> SeverControlService Set Actuator Options' );	// TODO REMOVE DEBUG LOG

			let amngr = routerActuators.actuatorsManager;
			let actuatorID = req.params.actuatorID;
			
			let options = req.body.options;
			
			let _response = {
					"context" : "ST Server Actuators",
					"action" : "Set Options of Actuator",
					"actuatorID": actuatorID,
					"options": options
				};
			
			try {
				
				if (options === undefined) {
					throw "Options are required.";
				}
				
				let actuatorSearch = amngr.getActuatorBy_sysID(actuatorID);
				if (actuatorSearch.stActuator === null ) {
					throw "Actuator not found";
				}
				
				let stActuator = actuatorSearch.stActuator;
				
				amngr.setOptionsOfActuator(stActuator, options);
				
			} catch (e) {
				// TODO: handle exception
				
				_response.response = 'Something happends...';
				_response.error = e;
			}
			
			
			res.jsonp(_response);
			res.end();
			
		});	
		
		
		
		
		
		// Start Actuator
		routerActuators.expressRoute.get('/:actuatorID/start', function(req, res) {
			
			console.log(' <*> SeverControlService Actuator Start' );	// TODO REMOVE DEBUG LOG
			
			var _response = {
					"context" : "ST Server Actuators",
					"action" : "Start",
					"actuatorID": req.params.actuatorID,
					"response" : "test"
				};
			
			
			try {
				
				var actuatorSearch = routerActuators.actuatorsManager.getActuatorBy_sysID(req.params.actuatorID);
				if (actuatorSearch.stActuator !== null ) {
					actuatorSearch.stActuator.start().then(function(value) {
						console.log( value );	// TODO REMOVE DEBUG LOG
						console.log(' <*> Actuator Started' );	// TODO REMOVE DEBUG LOG
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
		routerActuators.expressRoute.get('/:actuatorID/stop', function(req, res) {
			
			console.log(' <*> SeverControlService Actuator Stop' );	// TODO REMOVE DEBUG LOG
			
			var _response = {
					"context" : "ST Server Actuators",
					"action" : "Stop",
					"actuatorID": req.params.actuatorID,
					"response" : "test"
				};
			
			
			try {
				
				var actuatorSearch = routerActuators.actuatorsManager.getActuatorBy_sysID(req.params.actuatorID);
				if (actuatorSearch.stActuator !== null ) {
					actuatorSearch.stActuator.stop().then(function(value) {
						console.log( value );	// TODO REMOVE DEBUG LOG
						console.log(' <*> Actuator Stopped' );	// TODO REMOVE DEBUG LOG
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
		routerActuators.expressRoute.get('/:nodeID/turnOffActuators', function(req, res) {
			
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
