"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var express = require('express');

var SCS_RouteNetNodes = require("./SCS_RouteNetNodes.js");
var SCS_RouteNetServer = require("./SCS_RouteNetServer.js");

/**
 * Routes for Net
 * Use with Server control service
 */

var SCS_RouteNet = function () {
	function SCS_RouteNet(nodesManager, nodesNetManager, serverNetManager) {
		_classCallCheck(this, SCS_RouteNet);

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

	_createClass(SCS_RouteNet, [{
		key: "initialize",
		value: function initialize() {

			var routerNet = this;

			if (routerNet.expressRoute != null) {
				throw "Already initialized";
			}

			routerNet.expressRoute = express.Router();

			routerNet.routesforNodes = new SCS_RouteNetNodes(routerNet.nodesManager, routerNet.nodesNetManager);
			routerNet.routesforServer = new SCS_RouteNetServer(routerNet.serverNetManager);
		}
	}, {
		key: "mapServiceRoutes",
		value: function mapServiceRoutes() {

			var routerNet = this;

			if (routerNet.expressRoute == null) {
				throw "Not initialized";
			}

			routerNet.expressRoute.use('/Nodes', routerNet.routesforNodes.expressRoute);
			routerNet.expressRoute.use('/Server', routerNet.routesforServer.expressRoute);
		}
	}]);

	return SCS_RouteNet;
}();

module.exports = SCS_RouteNet;
//# sourceMappingURL=SCS_RouteNet.js.map
