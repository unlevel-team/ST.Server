"use strict";

let express = require('express');



/**
 * Routes for Net of Server
 * Use with Server control service
 */
class SCS_RouteNetServer {
	
	constructor(severNetManager, expressRoute) {
		this.expressRoute = null;
		this.messages = 0;
		
		this.severNetManager = severNetManager;
		this.expressRoute = expressRoute;
		
		this.mapServiceRoutes();
	}
	
	
	mapServiceRoutes() {
			
		let routerNet = this;
		
		if (routerNet.expressRoute == undefined || 
				routerNet.expressRoute == null) {
			routerNet.expressRoute = express.Router();
		}
		
		// middleware that is specific to this router
		routerNet.expressRoute.use(function messageCount(req, res, next) {
			 routerNet.messages++;
			
//			res.setHeader('Content-Type', 'text/html');
//			res.write('ST Server Nodes <br />', 'utf8')
			
			 res.setHeader('Content-Type', 'application/json');
			next();
		});
		
		// define the home page route
		routerNet.expressRoute.get('/', function(req, res) {
			let _response = {
				"context" : "ST Server Net of Server",
				"action" : "Default",
				"messagesReceived" : routerNet.messages
				
			};
			res.jsonp(_response);
			res.end();
		});
			
		
		// List of data channels
		routerNet.expressRoute.get('/list/', function(req, res) {
			
			var _response = {
				"context" : "ST Server Net of Server",
				"action" : "List",
				"numberOfDataChannels": 0,
				"dataChannels" : []
			};
			
			
			routerNet.severNetManager.channelsList.forEach(function(dch, _i) {
				let dchData = {
						"channelID" : dch.config.id,
						"type": dch.config.type,
						"mode": dch.config.mode
				};
				_response.dataChannels.push(dchData);
			});
			
			_response.numberOfDataChannels = routerNet.nodesNetManager.channelsList.length;
			
			
			res.jsonp(_response);
			res.end();
		});
		
		
		// Create data channel on server
		routerNet.expressRoute.get('/create/:channelID/:mode', function(req, res) {
			
			var _response = {
				"context" : "ST Server Net of Server",
				"action" : "Create data channel",
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
								
				routerNet.serverNetManager.addDataChannelToServer(req.params.channelID, dchConfig);
				
			} catch (e) {
				
				// TODO: handle exception
				
				_response.ERROR = e.message;
			}
			
			
			res.jsonp(_response);
			res.end();
		});

			
	}
}


module.exports = SCS_RouteNetServer;