"use strict";


/*
 Nodes Net service

 - Provides net service for nodes.
 - Add node to Net service
 - Remove data channel from node
 - Get data channels of node


*/

let EventEmitter = require('events').EventEmitter;



/**
 * Nodes net service constants
 */
const NodesNetService_CONSTANTS = {
		
	"Messages" : {
		"getNetInfo" : "Get Net Info",
		"NetInfo" : "Net Info",
		
		
		"createDataChannel" : "Create DC",
		"DataChannelCreated" : "DC Created",
		"deleteDataChannel" : "Delete DC",
		"DataChannelDeleted" : "DC Deleted",

		
		"ShutDownNode" : "ShutDownNode"

	},
	
	"Events" : {
		"DataChannelCreated" : "DC Created"
		


	}
};



/**
 * Nodes net service
 */
class NodesNetService {
	
	constructor(nodesManager, nodesNetManager) {
		
		this.nodesManager = nodesManager;
		this.nodesNetManager = nodesNetManager;
		
		this.CONSTANTS = NodesNetService_CONSTANTS;
		
		
	}
	
	initialize() {
		
		this._mapControlEvents();
		
	}
	
	
	/**
	 * Map control events
	 */
	_mapControlEvents() {
		
		let nnets = this;
		let nnetm = nnets.nodesNetManager;
		let ndsm = nnets.nodesManager;
		
		
		// Map event NodeAdded
		ndsm.eventEmitter.on(ndsm.CONSTANTS.Events.NodeAdded, function(data) {
			nnets.addNode(data.node);
			
		});
		
		// Map event DataChannelAdded
		nnetm.eventEmitter.on(nnetm.CONSTANTS.Events.DataChannelAdded, function(channelID) {
			
			let channelSearch = nnetm.getDataChannelByID(channelID);
			let dch = channelSearch.dataChannel;
			let node = dch.config._node;
			
			if (dch.config._synchro) {		// Data channel added in synchronization process
				dch.config._synchro = null;
			} else {
				var message = {
						"channelID" : dch.config._dchID,
						"mode" : dch.config.mode,
						"socketPort" : dch.config.socketPort,
						"netLocation" : dch.config.netLocation
					};
				
				node.socket.emit(nnets.CONSTANTS.Messages.createDataChannel, message);	// Emit message createDataChannel 
			
				console.log('<*> ST NodesNetService.createDataChannel');	// TODO REMOVE DEBUG LOG
				console.log(message);	// TODO REMOVE DEBUG LOG
			}
			

			
			console.log('<*> ST NodesNetService.DataChannelAdded');	// TODO REMOVE DEBUG LOG
		});
	}
	
	
	
	/**
	 * Add node
	 */
	addNode(node) {
		
		let nnets = this;
		let nnetm = nnets.nodesNetManager;
		let ndsm = nnets.nodesManager;
		
		
		console.log('<*> ST NodesNetService.addNode');	// TODO REMOVE DEBUG LOG

		
		let nodeSearch = ndsm.getNodeByID(node.config.nodeID);
		if (nodeSearch.stNode == null) {
			throw "node not found.";
		}
		
		let stNode = nodeSearch.stNode;
		
		
		if (stNode.config._nodesNetService && 
				stNode.config._nodesNetService.active) {
			throw "Node has net service.";
		}
		
		this._mapControlMessages(stNode);
		
		
		if (!stNode.config._nodesNetService) {
			stNode.config._nodesNetService = {
				"active" : true
			};
		}
		
		stNode.socket.emit(nnets.CONSTANTS.Messages.getNetInfo);	// Emit message getNetInfo
		
		console.log('<*> ST NodesNetService.addNode');	// TODO REMOVE DEBUG LOG
		console.log(' <···> Message getNetInfo emited.');	// TODO REMOVE DEBUG LOG


	}
	
	
	/**
	 * Map control messages
	 */
	_mapControlMessages(node, socket) {
		let nnets = this;
		let _node = node;
		
		if (socket == undefined) {
			socket = node.socket;
		}
		
		console.log('<*> ST NodesNetService._mapControlMessages');	// TODO REMOVE DEBUG LOG

		
		// Map event disconnect 
		socket.on('disconnect', function(){
			socket.removeAllListeners(nnets.CONSTANTS.Messages.getNetInfo);
			socket.removeAllListeners(nnets.CONSTANTS.Messages.NetInfo);
			socket.removeAllListeners(nnets.CONSTANTS.Messages.DataChannelCreated);
			_node.config._nodesNetService.active = false;	// Set active property to false

		  });
		
		// Map message getNetInfo
		socket.on(nnets.CONSTANTS.Messages.getNetInfo, function(msg){
			nnets._msg_getNetInfo(msg, socket, {
				"node" : _node.config.nodeID,
				"socket" : socket
			});
		  });
		
		// Map message NetInfo
		socket.on(nnets.CONSTANTS.Messages.NetInfo, function(msg){
			nnets._msg_NetInfo(msg, socket, {
				"node" : _node,
				"socket" : socket
			});
		  });
		
		
		// Map message DataChannelCreated
		socket.on(nnets.CONSTANTS.Messages.DataChannelCreated, function(msg){
			
			try {
				nnets._msg_DataChannelCreated(msg, socket, {
					"node" : _node.config.nodeID,
					"channelID" : msg.channelID
				});	
			} catch (e) {
				// TODO: handle exception
				console.log('<EEE> ST NodesNetService.DataChannelCreated');	// TODO REMOVE DEBUG LOG
				console.log(e.message);	// TODO REMOVE DEBUG LOG
			}
			
		  });	
	}
	
	
	/**
	 * Message getNetInfo
	 */
	_msg_getNetInfo(msg, socket, options){
		
		let nnets = this;
		var message = {};
		
		console.log('<*> ST NodesNetService._msg_getNetInfo');	// TODO REMOVE DEBUG LOG
		console.log(msg);	// TODO REMOVE DEBUG LOG


		var dcSearch = nnets.nodesNetManager.getDataChannelsOfNode( options.node );
		message.numDataChannels = dcSearch.numDataChannels;
		
		if (dcSearch.numDataChannels > 0) {
			message.dataChannels = [];
			
			dcSearch.dataChannels.forEach(function(dch, _i) {
				var channelInfo = {
						"id" : dch.config._dchID,
						"mode" : dch.config.mode,
						"type" : dch.config.type
					};
				message.dataChannels.push(channelInfo);
			});
		}
		
		
		socket.emit(nnets.CONSTANTS.Messages.NetInfo, message);	// Emit message NetInfo
	}
	
	
	/**
	 * Message NetInfo
	 */
	_msg_NetInfo(msg, socket, options){
		
		let nnets = this;
		let node = options.node;
		
		console.log('<*> ST NodesNetService._msg_NetInfo');	// TODO REMOVE DEBUG LOG
		console.log(msg);	// TODO REMOVE DEBUG LOG
		
		
		if (!node.config._nodesNetService.active) {
			nnets._synchroNodeChannels(node, msg.dataChannels, false);
			node.config._nodesNetService.active = true;
		} else {
			nnets._synchroNodeChannels(node, msg.dataChannels, true);
		}
		
	}
	
	
	
	/**
	 * Message DataChannelCreated
	 */
	_msg_DataChannelCreated(msg, socket, options){
		
		let nnets = this;
		let nnetm = nnets.nodesNetManager;
		var message = {};
		
		
		console.log('<*> ST NodesNetService._msg_DataChannelCreated');	// TODO REMOVE DEBUG LOG
		console.log(msg);	// TODO REMOVE DEBUG LOG
		console.log(options);	// TODO REMOVE DEBUG LOG
		
		
		var dcSearch = nnets.nodesNetManager.getDataChannelOfNode(options.node, options.channelID);
		if (dcSearch.dataChannel != null) {
			throw "Data channel not found.";
		}
		
		if (dcSearch.dataChannel.config._netState == undefined || 
				dcSearch.dataChannel.config._netState != nnetm.CONSTANTS.Config.DCstate_Config) {
			throw "Bad Data channel state.";
		}
		
		dcSearch.dataChannel.config._netState = nnetm.CONSTANTS.Config.DCstate_Ready;
		
	}
	
	
	/**
	 * Create data channel from node
	 */
	_createDCfromNode(nodeDCH, node) {
		
		let nnets = this;
		let nnetm = this.nodesNetManager;
		
		console.log('<*> ST NodesNetService._createDCfromNode');	// TODO REMOVE DEBUG LOG
		console.log(nodeDCH);	// TODO REMOVE DEBUG LOG

		
		// Create data channel from node
		try {
			var dchConfig = {
					"mode" : null,
					"_synchro" : true
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
			console.log('<EEE> ST NodesNetService._createDCfromNode');	// TODO REMOVE DEBUG LOG
			console.log(e.message);	// TODO REMOVE DEBUG LOG
			
		}
		
	
	}
	
	
	/**
	 * Delete data channel on server
	 */
	_deleteDConServer(dch, node) {
		let nnets = this;
		let nnetm = this.nodesNetManager;
		
		nnetm.removeDataChannelFromNode(node, dch.config._dchID);

	}
	

	/**
	 * Create data channel on node
	 */
	_createDConNode(dch, node) {
		
		let nnets = this;
		let nnetm = this.nodesNetManager;
		
		console.log('<*> ST NodesNetService._createDConNode');	// TODO REMOVE DEBUG LOG
		
		var message = {
				"channelID" : dch.config._dchID,
				"mode" : dch.config.mode,
				"socketPort" : dch.config.socketPort,
				"netLocation" : dch.config.netLocation
			};
			
		node.socket.emit(nnets.CONSTANTS.Messages.createDataChannel, message);	// Emit message createDataChannel 
		console.log(' <·> ST NodesNetService.createDataChannel');	// TODO REMOVE DEBUG LOG
		console.log(message);	// TODO REMOVE DEBUG LOG
		
	}
	
	
	/**
	 * Delete data channel on node
	 */
	_deleteDConNode(nodeDCH, node) {
		
		let nnets = this;
		let nnetm = this.nodesNetManager;
		
		var message = {
				"channelID" : nodeDCH.id,
				"synchro" : true
			};
			
		node.socket.emit(nnets.CONSTANTS.Messages.deleteDataChannel, message);	// Emit message deleteDataChannel 
		
	}
	
	
	
	/**
	 * Synchronize node channels
	 */
	_synchroNodeChannels(node, dchnlistOfNode, fromNode) {
		
		let nnets = this;
		let nnetm = this.nodesNetManager;
		
		if (fromNode == undefined) {
			fromNode = false;
		}
		
		console.log('<*> ST NodesNetService._synchroNodeChannels');	// TODO REMOVE DEBUG LOG
		console.log(dchnlistOfNode);	// TODO REMOVE DEBUG LOG
		console.log(fromNode);	// TODO REMOVE DEBUG LOG
		
		var dcSearch = nnets.nodesNetManager.getDataChannelsOfNode( node.config.id );	// Search data channels of node
		
		if (dcSearch.numDataChannels == 0) {	// No data channels for node
			
			if (fromNode) {
				dchnlistOfNode.forEach(function(_dchOfNode, _i) {
					nnets._createDCfromNode(_dchOfNode, node);	// Create data channel from node
				});
			} else {
				dchnlistOfNode.forEach(function(_dchOfNode, _i) {
					nnets._deleteDConNode(_dchOfNode, node);	// Delete data channel on node
				});
			}
			
		} else {
			
			dchnlistOfNode.forEach(function(_dchOfNode, _i) {	// Check channel list provided by node
				let chSearch = nnetm.getDataChannelByID(_dchOfNode.id);
				if (!chSearch.dataChannel){
					if (fromNode) {
						nnets._createDCfromNode(_dchOfNode, node );	// Create data channel from node
					} else {
						chSearch.dataChannel._synchroOP = "deleteOnNode";
						nnets._deleteDConNode(_dchOfNode, node);	// Delete data channel on node
					}
				}
			});
			
			
			dcSearch.forEach(function(_dch, _i) {	// Check the rest of the channels
				
				if (!_dch._synchroOP) {
					if (fromNode) {
						_dch._synchroOP = "deleteOnServer";
					} else {
						_dch._synchroOP = "createOnNode";
					}
				}
				
			});
			
			
			dcSearch.forEach(function(_dch, _i) {	// Do synchronization tasks
				
				switch (_dch._synchroOP) {
					case "createOnNode":
						nnets._createDConNode(_dch, node);	// Create data channel on node
						break;
					case "deleteOnServer":
						nnets._deleteDConServer(_dch, node);	// Delete data channel on server
						break;
	
					default:
						break;
				}
				
			});
			
		}
		
	}
	
	
	
}


var NodesNetService_Lib = {
	"CONSTANTS" : NodesNetService_CONSTANTS,
	"NodesNetService" : NodesNetService
	
};


module.exports = NodesNetService_Lib;