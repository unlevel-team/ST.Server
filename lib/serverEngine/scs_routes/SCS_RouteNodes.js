"use strict";

let express = require('express');




/**
 * Routes for Nodes
 */
class SCS_RouteNodes {
	
	constructor(nodesManager) {
		this.expressRoute = null;
		this.messages = 0;
		this.nodesManager = nodesManager;
		
		
		this.mapServiceRoutes();
	}
	
	/**
	 * Map routes of service
	 */
	mapServiceRoutes() {
		
		this.expressRoute = express.Router();
		let routerNodes = this;
		
		// middleware that is specific to this router
		this.expressRoute.use(function messageCount(req, res, next) {
			 routerNodes.messages++;
			
//			res.setHeader('Content-Type', 'text/html');
//			res.write('OC Server Nodes <br />', 'utf8')
			
			 res.setHeader('Content-Type', 'application/json');
			next();
		});
		
		// define the home page route
		this.expressRoute.get('/', function(req, res) {
//			res.write('Messages received: ' + routerNodes.messages + '<br />');
//			res.end();
			let _response = {
				"context" : "OC Server Nodes",
				"action" : "Default",
				"messagesReceived" : routerNodes.messages
				
			};
			res.jsonp(_response);
			res.end();
		});
		
		// define the home page route with commands
//		this.expressRoute.get('/:command', function(req, res) {
//
//			let _response = {
//					"context" : "OC Server Nodes",
//					"action" : "Command",
//					"commandReceived" : req.params.command
//					
//				};
//			res.jsonp(_response);
//		});
		
		
		// List of Nodes
		this.expressRoute.get('/list/', function(req, res) {
			
			var _response = {
				"context" : "OC Server Nodes",
				"action" : "list",
				"numberOfNodes": 0,
				"nodes" : []
			};
			
			var _i = 0;
			for (_i = 0; _i < routerNodes.nodesManager.nodeList.length; _i++) {
				let node = routerNodes.nodesManager.nodeList[_i];
				
				let nodeData = {
						"nodeID" : node.config.nodeID,
						"type": node.config.type,
						"numSensors": node.config.numSensors,
						"numActuators": node.config.numActuators
				};
				_response.nodes.push(nodeData);
			}
			
			_response.numberOfNodes = routerNodes.nodesManager.nodeList.length;
			
			
			res.jsonp(_response);
			res.end();
		});
		
		
		// Shut down Node
		this.expressRoute.get('/:nodeID/shutdown', function(req, res) {
			
			console.log(' <*> SeverControlService Nodes shutdown' );	// TODO OC REMOVE DEBUG LOG
			
			var _response = {
					"context" : "OC Server Nodes",
					"action" : "shutdown",
					"sensorID": req.params.nodeID,
					"response" : "test"
				};
			
			
			try {
				
				routerNodes.nodesManager.shutDownNode(req.params.nodeID);
				
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


module.exports = SCS_RouteNodes;
