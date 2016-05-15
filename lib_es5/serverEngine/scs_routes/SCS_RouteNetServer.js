"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var express = require('express');

/**
 * Routes for Net of Server
 * Use with Server control service
 */

var SCS_RouteNetNodes = function () {
	function SCS_RouteNetNodes(severNetManager) {
		_classCallCheck(this, SCS_RouteNetNodes);

		this.expressRoute = null;
		this.messages = 0;
		this.severNetManager = severNetManager;

		this.mapServiceRoutes();
	}

	_createClass(SCS_RouteNetNodes, [{
		key: 'mapServiceRoutes',
		value: function mapServiceRoutes() {

			this.expressRoute = express.Router();
			var routerNet = this;

			// middleware that is specific to this router
			this.expressRoute.use(function messageCount(req, res, next) {
				routerNet.messages++;

				//			res.setHeader('Content-Type', 'text/html');
				//			res.write('ST Server Nodes <br />', 'utf8')

				res.setHeader('Content-Type', 'application/json');
				next();
			});

			// define the home page route
			this.expressRoute.get('/', function (req, res) {
				var _response = {
					"context": "ST Server Net of Server",
					"action": "Default",
					"messagesReceived": routerNet.messages

				};
				res.jsonp(_response);
				res.end();
			});

			// List of data channels
			this.expressRoute.get('/list/', function (req, res) {

				var _response = {
					"context": "ST Server Net of Server",
					"action": "List",
					"numberOfDataChannels": 0,
					"dataChannels": []
				};

				routerNet.severNetManager.channelsList.forEach(function (dch, _i) {
					var dchData = {
						"channelID": dch.config.id,
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
			this.expressRoute.get('/create/:channelID/:mode', function (req, res) {

				var _response = {
					"context": "ST Server Net of Server",
					"action": "Create data channel",
					"nodeID": req.params.nodeID,
					"channelID": req.params.channelID,
					"mode": req.params.mode
				};

				try {

					var dchConfig = {
						"mode": null
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
	}]);

	return SCS_RouteNetNodes;
}();
//# sourceMappingURL=SCS_RouteNetServer.js.map
