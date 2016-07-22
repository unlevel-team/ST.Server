"use strict";

/*
 Nodes Manager
 
 - Provides nodes management
 - Manage event [NodeAdded]
 - Manage message [getNodeInfo]->[NodeInfo] and set configuration of node
 - Manage event [NodeDisconnected]
 - Shutdown node
 
 */

/**
 * import EventEmitter
 * @ignore
 */

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var EventEmitter = require('events').EventEmitter;

/**
 * NodesManager_CONSTANTS
 * @memberof st.serverEngine
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
 * 
 * @class
 * @memberof st.serverEngine
 * 
 * @property {string} state - State
 * @property {object} config - Configuration object
 * @property {object} socket - Socket object
 * @property {object} eventEmitter - Object for emit events
 * 
 * 
 */

var Node = function () {

	/**
  * @constructs Node
  * 
  * @param {object} config - Configuration object
  * @param {object} socket - Socket object
  */

	function Node(config, socket) {
		_classCallCheck(this, Node);

		this.state = null;

		this.config = config;
		this.socket = socket;

		this.eventEmitter = new EventEmitter();

		this.CONSTANTS = NodesManager_CONSTANTS;

		this.mapSocketEvents();
		this.mapSocketMessages();

		if (this.config === undefined || this.config === null) {
			this.state = this.CONSTANTS.States.Setup;
			// Emit message getNodeInfo
			this.socket.emit(this.CONSTANTS.Messages.getNodeInfo);
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
				// Emit event NodeDisconnected
				node.eventEmitter.emit(node.CONSTANTS.Events.NodeDisconnected, { "node": node });
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
 * The ServerConfiguration JSON file.
 * 
 * @typedef {Object} Result_Node
 * @memberof st.serverEngine.NodesManager
 * @type Object
 * 
 * @property {st.serverEngine.Node} stNode - Node
 * @property {number} position - Node position in list
 * 
 * 
 */

/**
 * ST Nodes Manager
 * 
 * @class
 * @memberof st.serverEngine
 * 
 * @property {Node[]} nodeList - Nodes list
 * @property {object} eventEmitter - Object for emit events
 * 
 */


var NodesManager = function () {

	/**
  * 
  * @constructs NodesManager
  */

	function NodesManager() {
		_classCallCheck(this, NodesManager);

		this.nodeList = [];

		this.eventEmitter = new EventEmitter();

		this.CONSTANTS = NodesManager_CONSTANTS;
	}

	/**
  * Add ST Node
  * 
  * @param {object} config - Node configuration
  * @param {socket} socket - Node control socket
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
   * 
   * @param {string} nodeID - Node ID
   * @param {string} state - State
   * 
   * @returns {NodesManager.Result_Node} 
   */

	}, {
		key: "getNodeByID",
		value: function getNodeByID(nodeID, state) {

			var ndm = this;
			var nodesList = ndm.nodeList;

			var node = null;
			var _i = -1;

			if (state === undefined) {
				state = NodesManager_CONSTANTS.States.Ready;
			}

			_i = nodesList.map(function (x) {
				return x.config.nodeID;
			}).indexOf(nodeID);
			if (_i !== -1) {
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
   * 
   * @param {object} socket - Socket object
   * 
   * @returns {NodesManager.Result_Node} 
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
			if (_i !== -1) {
				node = nodesList[_i];
			}

			return {
				"stNode": node,
				"position": _i
			};
		}

		/**
   * ShutDown Node
   * 
   * @param {string} nodeID - Node ID
   */

	}, {
		key: "shutDownNode",
		value: function shutDownNode(nodeID) {
			var ndm = this;

			var nodeSearch = ndm.getNodeByID(nodeID);
			if (nodeSearch.stNode !== null) {
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
			if (nodeSearch.stNode !== null && nodeSearch.stNode.state === ndm.CONSTANTS.States.Ready) {

				// Emit message BadNodeConfig
				stNode.socket.emit(ndm.CONSTANTS.Messages.BadNodeConfig, {
					"message": "nodeID duplicated."
				});
			} else {

				data.node.state = ndm.CONSTANTS.States.Ready;

				// Emit event NodeAdded
				ndm.eventEmitter.emit(ndm.CONSTANTS.Events.NodeAdded, data);
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

			var nodeID = stNode.config.nodeID.toString();

			if (nodeSearh.stNode !== null) {
				ndm.nodeList.splice(nodeSearh.position, 1);

				// Emit event NodeRemoved
				ndm.eventEmitter.emit(ndm.CONSTANTS.Events.NodeRemoved, { "nodeID": nodeID });
			}
		}
	}]);

	return NodesManager;
}();

module.exports = NodesManager;
//# sourceMappingURL=NodesManager.js.map
