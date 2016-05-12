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
		
		"getDataChannelOptions" : "get DC Options",
		"DataChannelOptions" : "DC Options",
		"SetDCOptions" : "Set DC Options",
		"DCOptionsUpdated" : "DC Options Updated"


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
				node.socket.emit(nnets.CONSTANTS.Messages.getDataChannelOptions, {"channelID": dch.config._dchID});	// Emit message getDataChannelOptions 
				
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
		
		
		// Map event DataChannelRemoved
		nnetm.eventEmitter.on(nnetm.CONSTANTS.Events.DataChannelRemoved, function(channelID) {
			
			console.log('<*> ST NodesNetService.DataChannelRemoved');	// TODO REMOVE DEBUG LOG
			console.log(' <·> ChannelID: ' + channelID);	// TODO REMOVE DEBUG LOG
			
		});
		
		
		// Map event DeleteDCOnNode
		nnetm.eventEmitter.on(nnetm.CONSTANTS.Events.DeleteDCOnNode, function(data) {
			
			nnets._deleteDConNode( { "id" : data.channelID }, data.node);
			
			console.log('<*> ST NodesNetService.DeleteDCOnNode');	// TODO REMOVE DEBUG LOG
			console.log(' <·> NodeID: ' + data.node.config.nodeID);	// TODO REMOVE DEBUG LOG
			console.log(' <·> ChannelID: ' + data.channelID);	// TODO REMOVE DEBUG LOG
			
		});
		
		
		// Map event SetDCOptionsOnNode
		nnetm.eventEmitter.on(nnetm.CONSTANTS.Events.SetDCOptionsOnNode, function(data) {
			
			nnets._event_SetDCOptionsOnNode(data);
			
			console.log('<*> ST NodesNetService.SetDCOptionsOnNode');	// TODO REMOVE DEBUG LOG
			console.log(' <·> NodeID: ' + data.node.config.nodeID);	// TODO REMOVE DEBUG LOG
			console.log(' <·> ChannelID: ' + data.channelID);	// TODO REMOVE DEBUG LOG
			console.log(' <·> Options: ' + data.options);	// TODO REMOVE DEBUG LOG
			
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
			socket.removeAllListeners(nnets.CONSTANTS.Messages.DataChannelDeleted);
			socket.removeAllListeners(nnets.CONSTANTS.Messages.DataChannelOptions);
			socket.removeAllListeners(nnets.CONSTANTS.Messages.DCOptionsUpdated);

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
					"node" : _node,
					"nodeID" : _node.config.nodeID,
					"channelID" : msg.channelID
				});	
			} catch (e) {
				// TODO: handle exception
				console.log('<EEE> ST NodesNetService.DataChannelCreated');	// TODO REMOVE DEBUG LOG
				console.log(e);	// TODO REMOVE DEBUG LOG
			}
			
		  });
		
		
		// Map message DataChannelDeleted
		socket.on(nnets.CONSTANTS.Messages.DataChannelDeleted, function(msg){
			
			try {
				nnets._msg_DataChannelDeleted(msg, socket, {
					"node" : _node,
					"nodeID" : _node.config.nodeID,
					"channelID" : msg.channelID
				});	
			} catch (e) {
				// TODO: handle exception
				console.log('<EEE> ST NodesNetService.DataChannelDeleted');	// TODO REMOVE DEBUG LOG
				console.log(e);	// TODO REMOVE DEBUG LOG
			}
			
		  });
		
		
		// Map message DataChannelOptions
		socket.on(nnets.CONSTANTS.Messages.DataChannelOptions, function(msg){
			
			try {
				nnets._msg_DataChannelOptions(msg, socket, {
					"node" : _node,
					"nodeID" : _node.config.nodeID,
					"channelID" : msg.channelID,
					"options" : msg.options
				});	
			} catch (e) {
				// TODO: handle exception
				console.log('<EEE> ST NodesNetService.DataChannelOptions');	// TODO REMOVE DEBUG LOG
				console.log(e);	// TODO REMOVE DEBUG LOG
			}
			
		  });
		
		// Map message DCOptionsUpdated
		socket.on(nnets.CONSTANTS.Messages.DCOptionsUpdated, function(msg){
			
			try {
				nnets._msg_DCOptionsUpdated(msg, socket, {
					"node" : _node,
					"nodeID" : _node.config.nodeID,
					"channelID" : msg.channelID
				});	
			} catch (e) {
				// TODO: handle exception
				console.log('<EEE> ST NodesNetService.DCOptionsUpdated');	// TODO REMOVE DEBUG LOG
				console.log(e);	// TODO REMOVE DEBUG LOG
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
		let stNode = options.node;
		
		var message = {};
		
		
		console.log('<*> ST NodesNetService._msg_DataChannelCreated');	// TODO REMOVE DEBUG LOG
		console.log(msg);	// TODO REMOVE DEBUG LOG
		console.log(options);	// TODO REMOVE DEBUG LOG
		
		
		var dcSearch = nnets.nodesNetManager.getDataChannelOfNode(options.nodeID, options.channelID);
		if (dcSearch.dataChannel == null) {
			throw "Data channel not found.";
		}
		
		let dch = dcSearch.dataChannel;
		
		if (dch.config._netState == undefined || 
				dch.config._netState != nnetm.CONSTANTS.States.DCstate_Config) {
			throw "Bad Data channel state.";
		}
		
		dch.config._netState = nnetm.CONSTANTS.States.DCstate_Ready;
		
		stNode.socket.emit(nnets.CONSTANTS.Messages.getDataChannelOptions, {"channelID": options.channelID});	// Emit message getDataChannelOptions
		
	}
	
	
	/**
	 * Message DataChannelDeleted
	 */
	_msg_DataChannelDeleted(msg, socket, options){
		
		let nnets = this;
		let nnetm = nnets.nodesNetManager;
		var message = {};
		
		console.log('<*> ST NodesNetService._msg_DataChannelDeleted');	// TODO REMOVE DEBUG LOG
		console.log(msg);	// TODO REMOVE DEBUG LOG
		console.log(options);	// TODO REMOVE DEBUG LOG
		
		try {
			nnetm.removeDataChannelFromNode(options.node, msg.channelID);
		} catch (e) {
			// TODO: handle exception
			console.log('<EEE> ST NodesNetService._msg_DataChannelDeleted');	// TODO REMOVE DEBUG LOG
			console.log(e);	// TODO REMOVE DEBUG LOG
			
		}
		
	}
	
	
	
	/**
	 * Message DataChannelOptions
	 */
	_msg_DataChannelOptions(msg, socket, options){
		
		let nnets = this;
		let nnetm = nnets.nodesNetManager;
		let node = options.node;
		
		var message = {};
		
		console.log('<*> ST NodesNetService._msg_DataChannelOptions');	// TODO REMOVE DEBUG LOG
		console.log(msg);	// TODO REMOVE DEBUG LOG
		console.log(options);	// TODO REMOVE DEBUG LOG
		
		try {

			let dchSearch = nnetm.getDataChannelOfNode(options.nodeID, options.channelID);
			if (dchSearch.dataChannel == null) {
				throw "Data channel not found.";
			}
			
			let dch = dchSearch.dataChannel;
			let dchOptions = options.options;
			
			dch.config._netState = dchOptions.state;
			dch.config.socketPort = dchOptions.socketPort;
			dch.config.netLocation = dchOptions.netLocation;
			
		} catch (e) {
			// TODO: handle exception
			console.log('<EEE> ST NodesNetService._msg_DataChannelOptions');	// TODO REMOVE DEBUG LOG
			console.log(e);	// TODO REMOVE DEBUG LOG
			
		}
		
	}
	
	
	/**
	 * Message DCOptionsUpdated
	 */
	_msg_DCOptionsUpdated(msg, socket, options){
		
		let nnets = this;
		let nnetm = nnets.nodesNetManager;
		let node = options.node;
		
		var message = {};
		
		console.log('<*> ST NodesNetService._msg_DCOptionsUpdated');	// TODO REMOVE DEBUG LOG
		console.log(msg);	// TODO REMOVE DEBUG LOG
		console.log(options);	// TODO REMOVE DEBUG LOG
		
		
		try {

			let dchSearch = nnetm.getDataChannelOfNode(options.nodeID, options.channelID);
			if (dchSearch.dataChannel == null) {
				throw "Data channel not found.";
			}
			
			let dch = dchSearch.dataChannel;
			let dchOptions = options.options;
			
			let message = {
					"channelID" : dch.config._dchID
				};
			
			node.socket.emit(nnets.CONSTANTS.Messages.getDataChannelOptions, message);	// Emit message getDataChannelOptions 
			
		} catch (e) {
			// TODO: handle exception
			console.log('<EEE> ST NodesNetService._msg_DCOptionsUpdated');	// TODO REMOVE DEBUG LOG
			console.log(e);	// TODO REMOVE DEBUG LOG
			
		}
		
	}
	
	
	/**
	 * Create data channel on node
	 */
	_createDConNode(dch, node) {
		
		let nnets = this;
		let nnetm = nnets.nodesNetManager;
		
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
		let nnetm = nnets.nodesNetManager;
		
		console.log('<*> ST NodesNetService._deleteDConNode');	// TODO REMOVE DEBUG LOG
		console.log(nodeDCH);	// TODO REMOVE DEBUG LOG
		
		try {
			var message = {
					"channelID" : nodeDCH.id,
					"synchro" : true
				};
				
			node.socket.emit(nnets.CONSTANTS.Messages.deleteDataChannel, message);	// Emit message deleteDataChannel 
		} catch (e) {
			// TODO: handle exception
			console.log('<EEE> ST NodesNetService._deleteDConNode');	// TODO REMOVE DEBUG LOG
			console.log(e.message);	// TODO REMOVE DEBUG LOG
		}
		
	}
	
	
	
	/**
	 * Synchronize node channels
	 */
	_synchroNodeChannels(node, dchnlistOfNode, fromNode) {
		
		let nnets = this;
		let nnetm = nnets.nodesNetManager;
		
		if (fromNode == undefined) {
			fromNode = false;
		}
		
		
		var dcSearch = nnetm.getDataChannelsOfNode( node.config.nodeID );	// Search data channels of node
		
		
		console.log('<*> ST NodesNetService._synchroNodeChannels');	// TODO REMOVE DEBUG LOG
		console.log(dchnlistOfNode);	// TODO REMOVE DEBUG LOG
		console.log(fromNode);	// TODO REMOVE DEBUG LOG
		console.log(dcSearch);	// TODO REMOVE DEBUG LOG

		
		if (dcSearch.numDataChannels == 0) {	// No data channels for node
			
			if (fromNode) {
				dchnlistOfNode.forEach(function(_dchOfNode, _i) {
					nnetm._createDCfromNode(_dchOfNode, node);	// Create data channel from node
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
						nnetm._createDCfromNode(_dchOfNode, node );	// Create data channel from node
					} else {
						chSearch.dataChannel._synchroOP = "deleteOnNode";
						nnets._deleteDConNode(_dchOfNode, node);	// Delete data channel on node
					}
				}
			});
			
			
			dcSearch.dataChannels.forEach(function(_dch, _i) {	// Check the rest of the channels
				
				if (!_dch._synchroOP) {
					if (fromNode) {
						_dch._synchroOP = "deleteOnServer";
					} else {
						_dch._synchroOP = "createOnNode";
					}
				}
				
			});
			
			
			dcSearch.dataChannels.forEach(function(_dch, _i) {	// Do synchronization tasks
				
				switch (_dch._synchroOP) {
					case "createOnNode":
						nnets._createDConNode(_dch, node);
						break;
					case "deleteOnServer":
						nnetm._deleteDConServer(_dch, node);
						break;
	
					default:
						break;
				}
				
			});
			
		}
		
	}

	
	
	/**
	 * Set options of data channel on node
	 */
	_event_SetDCOptionsOnNode(data) {
		
		let nnets = this;
		let nnetm = nnets.nodesNetManager;
		
		let node = data.node;
		let channelID = data.channelID;
		let options = data.options;
		
		
		console.log('<*> ST NodesNetService._event_SetDCOptionsOnNode');	// TODO REMOVE DEBUG LOG
		console.log(channelID);	// TODO REMOVE DEBUG LOG
		
		try {
			var message = {
					"channelID" : channelID,
					"options" : options
				};
				
			node.socket.emit(nnets.CONSTANTS.Messages.SetDCOptions, message);	// Emit message SetDCOptions 
			
		} catch (e) {
			// TODO: handle exception
			console.log('<EEE> ST NodesNetService._event_SetDCOptionsOnNode');	// TODO REMOVE DEBUG LOG
			console.log(e.message);	// TODO REMOVE DEBUG LOG
		}
		
	}
	
	
	
	
}


var NodesNetService_Lib = {
	"CONSTANTS" : NodesNetService_CONSTANTS,
	"NodesNetService" : NodesNetService
	
};


module.exports = NodesNetService_Lib;