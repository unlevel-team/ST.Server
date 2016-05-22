"use strict";

let express = require('express');

let SCS_RouteNetNodes = require("./SCS_RouteNetNodes.js");
let SCS_RouteNetServer = require("./SCS_RouteNetServer.js");

/**
 * Routes for Net
 * Use with Server control service
 */
class SCS_RouteNet {
	
	constructor(nodesManager, nodesNetManager, serverNetManager) {
		
		this.expressRoute = null;
		this.messages = 0;
		
		this.nodesManager = nodesManager;
		this.nodesNetManager = nodesNetManager;
		this.serverNetManager = serverNetManager;
		
		this.routesforNodes = null;
		this.routesforServer = null;
		
		this.expressRoute = null;
		
		this.initialize();
		this.mapServiceRoutes();
	}
	
	
	initialize() {
		
		let routerNet = this;
		
		if (routerNet.expressRoute != null) {
			throw "Already initialized";
		}
		
		routerNet.expressRoute = express.Router();
		
		routerNet.routesforNodes = new SCS_RouteNetNodes(routerNet.nodesManager, routerNet.nodesNetManager);
		routerNet.routesforServer = new SCS_RouteNetServer(routerNet.serverNetManager);
		
	}
	
	
	mapServiceRoutes() {
		
		let routerNet = this;
		
		if (routerNet.expressRoute == null) {
			throw "Not initialized";
		}
	
		routerNet.expressRoute.use('/Nodes', routerNet.routesforNodes.expressRoute);
		routerNet.expressRoute.use('/Server', routerNet.routesforServer.expressRoute);
		
	}
	
}


module.exports = SCS_RouteNet;