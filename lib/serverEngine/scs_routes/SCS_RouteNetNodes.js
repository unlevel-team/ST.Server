"use strict";

let express = require('express');



/**
 * Routes for Net of Nodes
 * Use with Server control service
 */
class SCS_RouteNetNodes {
	
	constructor(nodesManager, nodesNetManager) {
		this.expressRoute = null;
		this.messages = 0;
		this.nodesManager = nodesManager;
		this.nodesNetManager = nodesNetManager;
		
		
		this.mapServiceRoutes();
	}
	
	mapServiceRoutes() {
		
		this.expressRoute = express.Router();
		let routerNet = this;
		
		// middleware that is specific to this router
		this.expressRoute.use(function messageCount(req, res, next) {
			 routerNet.messages++;
			
//			res.setHeader('Content-Type', 'text/html');
//			res.write('ST Server Nodes <br />', 'utf8')
			
			 res.setHeader('Content-Type', 'application/json');
			next();
		});
		
		// define the home page route
		this.expressRoute.get('/', function(req, res) {
			let _response = {
				"context" : "ST Server Net of Nodes",
				"action" : "Default",
				"messagesReceived" : routerNet.messages
				
			};
			res.jsonp(_response);
			res.end();
		});
		
		// List of data channels
		this.expressRoute.get('/list/', function(req, res) {
			
			var _response = {
				"context" : "ST Server Net of Nodes",
				"action" : "List",
				"numberOfDataChannels": 0,
				"dataChannels" : []
			};
			
			
			routerNet.nodesNetManager.channelsList.forEach(function(dch, _i) {
				let dchData = {
						"channelID" : dch.config.id,
						"type": dch.config.type,
						"mode": dch.config.mode,
						"state": dch.config.state
				};
				_response.dataChannels.push(dchData);
			});
			
			_response.numberOfDataChannels = routerNet.nodesNetManager.channelsList.length;
			
			
			res.jsonp(_response);
			res.end();
		});
		
		
		// List of data channels for node
		this.expressRoute.get('/:nodeID/list/', function(req, res) {
			
			var _response = {
				"context" : "ST Server Net of Nodes",
				"action" : "List for node",
				"nodeID" : req.params.nodeID,
				"numberOfDataChannels": 0,
				"dataChannels" : []
			};
			
			
			var dchSearch = routerNet.nodesNetManager.getDataChannelsOfNode(req.params.nodeID);
			
			dchSearch.dataChannels.forEach(function(dch, _i) {
				let dchData = {
						"channelID" : dch.config.id,
						"type": dch.config.type,
						"mode": dch.config.mode,
						"state": dch.config.state
				};
				_response.dataChannels.push(dchData);
			});
			
			_response.numberOfDataChannels = dchSearch.dataChannels.length;

			
			res.jsonp(_response);
			res.end();
		});
		
		// Create data channel on node
		this.expressRoute.get('/:nodeID/create/:channelID/:mode', function(req, res) {
			
			var _response = {
				"context" : "ST Server Net of Nodes",
				"action" : "Create input data channel",
				"nodeID" : req.params.nodeID,
				"channelID" : req.params.channelID,
				"mode" : req.params.mode
			};
			
			
			try {
				
				var dchConfig = {
					"mode" : null
				};
				
				switch (_response.mode) {
					case "in":
						dchConfig.mode = routerNet.nodesNetManager.CONSTANTS.Config.modeIN;
						break;
		
					case "out":
						dchConfig.mode = routerNet.nodesNetManager.CONSTANTS.Config.modeOUT;
						break;	
						
					default:
						throw "Bad mode.";
						break;
				}
				
				
				let nodeSearch = routerNet.nodesManager.getNodeByID(_response.nodeID);
				if (nodeSearch.stNode == null) {
					throw "Node not found.";
				}
				
				try {
					routerNet.nodesNetManager.addDataChannelToNode(nodeSearch.stNode, req.params.channelID, dchConfig);

				} catch (e) {
					throw "Error adding channel. " + e.message;
				}
				
				
			} catch (e) {
				
				// TODO: handle exception
				
				_response.ERROR = e.message;
			}
			
			
			res.jsonp(_response);
			res.end();
		});
		
	}
}


module.exports = SCS_RouteNetNodes;
