"use strict";

/*
 Nodes Net manager

 - Provides net management for nodes.
 - Add data channel to node
 - Remove data channel from node
 - Get data channels of node


 */

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DataChannelsManager = require('st.network').DataChannelsManager;

//let DataChannelsManager = require('../stNetwork/DataChannel.js').DataChannelsManager;

/**
 * Nodes net manager
 */

var NodesNetManager = function (_DataChannelsManager) {
	_inherits(NodesNetManager, _DataChannelsManager);

	function NodesNetManager() {
		_classCallCheck(this, NodesNetManager);

		var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(NodesNetManager).call(this));

		var nnetm = _this;

		nnetm.CONSTANTS.Events.DeleteDCOnNode = "Delete DC on Node";
		nnetm.CONSTANTS.Events.SetDCOptionsOnNode = "Set DC optons on Node";
		return _this;
	}

	/**
  * Add data channel to node
  */


	_createClass(NodesNetManager, [{
		key: "addDataChannelToNode",
		value: function addDataChannelToNode(node, dchID, config) {

			var nnetm = this;

			var dch_Config = {
				'id': node.config.nodeID + '.' + dchID,
				'type': nnetm.CONSTANTS.Config.DCtype_socketio,
				'_node': node,
				'_nodeID': node.config.nodeID,
				'_dchID': dchID,
				'_netState': nnetm.CONSTANTS.States.DCstate_Config
			};

			// · · · ^^^ · · ·  ^^^ · · ·  ^^^ · · · ^^^ · · ·  ^^^ · |\/|···
			// Extra config parameters
			if (config != undefined && config != null) {

				if (config.mode) {
					dch_Config.mode = config.mode;
				}

				if (config.socketPort) {
					dch_Config.socketPort = config.socketPort;
				}

				if (config.netLocation) {
					dch_Config.netLocation = config.netLocation;
				}

				if (config._synchro) {
					dch_Config._synchro = config._synchro;
				}
			}
			// · · · ^^^ · · ·  ^^^ · · ·  ^^^ · · · ^^^ · · ·  ^^^ · |/\|···

			console.log('<*> ST NodesNetManager.addDataChannelToNode'); // TODO REMOVE DEBUG LOG
			console.log(' <·> Channel ID: ' + dch_Config._dchID); // TODO REMOVE DEBUG LOG
			console.log(' <·> Node ID:' + dch_Config._nodeID); // TODO REMOVE DEBUG LOG

			try {
				var dch = DataChannelsManager.get_DataChannel(dch_Config);
				nnetm.addDataChannel(dch);
			} catch (e) {
				throw "Cannot add Datachannel. " + e.message;
			}
		}

		/**
   * Remove data channel from node
   */

	}, {
		key: "removeDataChannelFromNode",
		value: function removeDataChannelFromNode(node, dchID) {
			var nnetm = this;
			nnetm.removeDataChannel(node.config.nodeID + '.' + dchID);
		}

		/**
   * Get data channel of node
   */

	}, {
		key: "getDataChannelOfNode",
		value: function getDataChannelOfNode(nodeID, dchID) {
			var nnetm = this;
			return nnetm.getDataChannelByID(nodeID + '.' + dchID);
		}

		/**
   * Returns data channels searched by DataChannel.config._nodeID
   */

	}, {
		key: "getDataChannelsOfNode",
		value: function getDataChannelsOfNode(nodeID) {

			var nnetm = this;

			var nodeDCHs = nnetm.channelsList.filter(function (dch, _i, _items) {

				if (dch.config._nodeID == nodeID) {
					return true;
				}
			});

			return {
				"numDataChannels": nodeDCHs.length,
				"dataChannels": nodeDCHs
			};
		}

		/**
   * Set options of data channel
   */

	}, {
		key: "setOptionsOfDataChannel",
		value: function setOptionsOfDataChannel(dch, options) {

			var nnetm = this;

			console.log('<*> ST NodesNetManager.setOptionsOfDataChannel'); // TODO REMOVE DEBUG LOG
			console.log(options); // TODO REMOVE DEBUG LOG

			nnetm.eventEmitter.emit(nnetm.CONSTANTS.Events.SetDCOptionsOnNode, { "node": dch.config._node,
				"channelID": dch.config._dchID,
				"options": options
			}); // Emit event SetDCOptionsOnNode
		}

		/**
   * Create data channel from node
   *
   * Synchronization tasks
   */

	}, {
		key: "_createDCfromNode",
		value: function _createDCfromNode(nodeDCH, node) {

			var nnetm = this;

			console.log('<*> ST NodesNetManager._createDCfromNode'); // TODO REMOVE DEBUG LOG
			console.log(nodeDCH); // TODO REMOVE DEBUG LOG

			// Create data channel from node
			try {
				var dchConfig = {
					"mode": null,
					"_synchro": true
				};

				switch (nodeDCH.mode) {
					case "input":
						dchConfig.mode = nnetm.CONSTANTS.Config.modeIN;
						break;

					case "output":
						dchConfig.mode = nnetm.CONSTANTS.Config.modeOUT;
						break;

					default:
						throw "Bad mode.";
						break;
				}

				try {
					nnetm.addDataChannelToNode(node, nodeDCH.id, dchConfig);
				} catch (e) {
					throw "Error adding channel. " + e.message;
				}
			} catch (e) {
				// TODO: handle exception
				console.log('<EEE> ST NodesNetManager._createDCfromNode'); // TODO REMOVE DEBUG LOG
				console.log(e.message); // TODO REMOVE DEBUG LOG
			}
		}

		/**
   * Delete data channel on server
   */

	}, {
		key: "_deleteDConServer",
		value: function _deleteDConServer(dch, node) {

			var nnetm = this;

			console.log('<*> ST NodesNetManager._deleteDConServer'); // TODO REMOVE DEBUG LOG
			console.log(' <·> ' + dch.config.id); // TODO REMOVE DEBUG LOG

			try {
				nnetm.removeDataChannelFromNode(node, dch.config._dchID);
			} catch (e) {
				// TODO: handle exception
				console.log('<EEE> ST NodesNetManager._deleteDConServer'); // TODO REMOVE DEBUG LOG
				console.log(e.message); // TODO REMOVE DEBUG LOG
			}
		}

		/**
   * Delete data channel on node
   */

	}, {
		key: "_deleteDConNode",
		value: function _deleteDConNode(channelID, stNode) {

			var nnetm = this;
			nnetm.eventEmitter.emit(nnetm.CONSTANTS.Events.DeleteDCOnNode, { "node": stNode, "channelID": channelID }); // Emit event DeleteDCOnNode
		}
	}]);

	return NodesNetManager;
}(DataChannelsManager);

module.exports = NodesNetManager;
//# sourceMappingURL=NodesNetManager.js.map
