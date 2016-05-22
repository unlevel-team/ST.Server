"use strict";

/*
 Nodes Manager
 
 - Provides nodes management
 - Manage event [NodeAdded]
 - Manage message [getNodeInfo]->[NodeInfo] and set configuration of node
 - Manage event [NodeDisconnected]
 - Shutdown node
 
 */

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var EventEmitter = require('events').EventEmitter;

/**
 * NodesManager_CONSTANTS
 */
var NodesManager_CONSTANTS = {

	"States": {
		"Setup": "Setup",
		"Ready": "Ready"

	},

	"Events": {
		"NodeDisconnected": "Node Disconnected",
		"NodeRemoved": "Node Removed",
		"NodeAdded": "Node Added"

	},

	"Messages": {
		"getNodeInfo": "Get Node Info",
		"NodeInfo": "Node Info",
		"BadNodeConfig": "Bad Node Config",

		"ShutDownNode": "ShutDownNode"

	}
};

/**
 * ST Node
 */

var Node = function () {
	function Node(config, socket) {
		_classCallCheck(this, Node);

		this.state = null;

		this.config = config;
		this.socket = socket;

		this.eventEmitter = new EventEmitter();

		this.CONSTANTS = NodesManager_CONSTANTS;

		this.mapSocketEvents();
		this.mapSocketMessages();

		if (this.config == null) {
			this.state = this.CONSTANTS.States.Setup;
			this.socket.emit(this.CONSTANTS.Messages.getNodeInfo); // Emit message getNodeInfo
		}
	}

	/**
  * Map socket events
  */


	_createClass(Node, [{
		key: "mapSocketEvents",
		value: function mapSocketEvents() {

			var node = this;

			// Map event disconnect
			node.socket.on('disconnect', function () {
				node.eventEmitter.emit(node.CONSTANTS.Events.NodeDisconnected, { "node": node }); // Emit event NodeDisconnected
			});
		}

		/**
   * Map socket messages
   */

	}, {
		key: "mapSocketMessages",
		value: function mapSocketMessages() {

			var node = this;

			// Map message NodeInfo
			node.socket.on(node.CONSTANTS.Messages.NodeInfo, function (msg) {

				console.log('<*> ST Node.Messages.NodeInfo'); // TODO REMOVE DEBUG LOG
				console.log(msg); // TODO REMOVE DEBUG LOG

				node.config = msg;

				// Emit event NodeAdded
				node.eventEmitter.emit(node.CONSTANTS.Events.NodeAdded, { "node": node });
			});
		}
	}]);

	return Node;
}();

/**
 * ST Nodes Manager
 */


var NodesManager = function () {
	function NodesManager() {
		_classCallCheck(this, NodesManager);

		this.nodeList = [];

		this.eventEmitter = new EventEmitter();

		this.CONSTANTS = NodesManager_CONSTANTS;
	}

	/**
  * Add ST Node
  */


	_createClass(NodesManager, [{
		key: "addNode",
		value: function addNode(config, socket) {

			var stNode = new Node(config, socket);
			var ndm = this;

			// Map Event NodeAdded
			stNode.eventEmitter.on(stNode.CONSTANTS.Events.NodeAdded, function (data) {

				ndm._event_NodeAdded(data, stNode);
			});

			// Map Event NodeDisconnected		
			stNode.eventEmitter.on(stNode.CONSTANTS.Events.NodeDisconnected, function (data) {

				ndm._event_NodeDisconnected(data, stNode);
			});

			ndm.nodeList.push(stNode);
		}

		/**
   * Returns Node searched by ID
   */

	}, {
		key: "getNodeByID",
		value: function getNodeByID(nodeID, state) {

			var ndm = this;
			var nodesList = ndm.nodeList;

			var node = null;
			var _i = -1;

			if (state == undefined) {
				state = NodesManager_CONSTANTS.States.Ready;
			}

			_i = nodesList.map(function (x) {
				return x.config.nodeID;
			}).indexOf(nodeID);
			if (_i != -1) {
				node = nodesList[_i];
			}

			//		for (_i = 0; _i < nodesList.length; _i++) {
			//			if (nodesList[_i].config.nodeID == nodeID &&
			//					nodesList[_i].state == state) {
			//				node = nodesList[_i];
			//				break;
			//			}
			//		}

			return {
				"stNode": node,
				"position": _i
			};
		}

		/**
   * Returns Node searched by Socket
   */

	}, {
		key: "getNodeBySocket",
		value: function getNodeBySocket(socket) {

			var ndm = this;
			var nodesList = ndm.nodeList;

			var node = null;
			var _i = 0;

			_i = nodesList.map(function (x) {
				return x.socket.id;
			}).indexOf(socket.id);
			if (_i != -1) {
				node = nodesList[_i];
			}

			return {
				"stNode": node,
				"position": _i
			};
		}

		/**
   * ShutDown Node
   */

	}, {
		key: "shutDownNode",
		value: function shutDownNode(nodeID) {
			var ndm = this;

			var nodeSearch = ndm.getNodeByID(nodeID);
			if (nodeSearch.stNode != null) {
				nodeSearch.stNode.socket.emit(ndm.CONSTANTS.Messages.ShutDownNode); // Emit message ShutDownNode
			}
		}

		/**
   * Event NodeAdded
   */

	}, {
		key: "_event_NodeAdded",
		value: function _event_NodeAdded(data, stNode) {

			var ndm = this;

			var nodeSearch = ndm.getNodeByID(data.node.config.nodeID);
			if (nodeSearch.stNode != null && nodeSearch.stNode.state == ndm.CONSTANTS.States.Ready) {

				// Emit message BadNodeConfig
				stNode.socket.emit(ndm.CONSTANTS.Messages.BadNodeConfig, {
					"message": "nodeID duplicated."
				});
			} else {
				data.node.state = ndm.CONSTANTS.States.Ready;
				ndm.eventEmitter.emit(ndm.CONSTANTS.Events.NodeAdded, data); // Emit event NodeAdded
			}
		}

		/**
   * Event NodeDisconnected
   */

	}, {
		key: "_event_NodeDisconnected",
		value: function _event_NodeDisconnected(data, stNode) {

			var ndm = this;

			var nodeSearh = ndm.getNodeBySocket(data.node.socket);

			if (nodeSearh.stNode != null) {
				ndm.nodeList.splice(nodeSearh.position, 1);
				ndm.eventEmitter.emit(ndm.CONSTANTS.Events.NodeRemoved); // Emit event NodeRemoved
			}
		}
	}]);

	return NodesManager;
}();

module.exports = NodesManager;
//# sourceMappingURL=NodesManager.js.map
