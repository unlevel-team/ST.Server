"use strict";

/*
 Nodes Net manager
 
 - Provides net management for nodes.
 - Add data channel to node
 - Remove data channel from node
 - Get data channels of node
 
 
 */

let DataChannelsManager = require('../stNetwork/DataChannel.js').DataChannelsManager;


/**
 * Nodes net manager
 */
class NodesNetManager extends DataChannelsManager {
	
	
	constructor() {
		super();
	}
	
	
	/**
	 * Add data channel to node
	 */
	addDataChannelToNode(node, dchID, config) {
		
		let nnetm = this;
		
		var dch_Config = {
			'id' : node.config.nodeID + '.' + dchID,
			'type' : nnetm.CONSTANTS.Config.DCtype_socketio,
			'_node' : node,
			'_nodeID' : node.config.nodeID,
			'_dchID' : dchID,
			'_netState' : nnetm.CONSTANTS.States.DCstate_Config
		};
		
		
		// · · · ^^^ · · ·  ^^^ · · ·  ^^^ · · · ^^^ · · ·  ^^^ · |\/|··· 
		// Extra config parameters
		if (config != undefined && 
				config != null) {
			
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
		
		
		console.log('<*> ST NodesNetManager.addDataChannelToNode');	// TODO REMOVE DEBUG LOG
		console.log(dch_Config);	// TODO REMOVE DEBUG LOG
		
		try {
			var dch = DataChannelsManager.get_DataChannel(dch_Config);
			this.addDataChannel(dch);
		} catch (e) {
			throw "Cannot add Datachannel. " + e.message;
		}
		
	}
	
	
	/**
	 * Remove data channel from node
	 */
	removeDataChannelFromNode(node, dchID) {
		this.removeDataChannel(node.config.nodeID + '.' + dchID);
	}
	
	
	/**
	 * Get data channel of node
	 */
	getDataChannelOfNode(nodeID, dchID) {
		return this.getDataChannelByID(nodeID + '.' + dchID);
	}
	
	
	/**
	 * Returns data channels searched by DataChannel.config._nodeID
	 */
	getDataChannelsOfNode(nodeID){
		
		var nodeDCHs = this.channelsList.filter(function(dch, _i, _items) {
			
			if (dch.config._nodeID == nodeID) {
				return true;
			}
			
		});
		
		return {
			"numDataChannels": nodeDCHs.length,
			"dataChannels": nodeDCHs
		}
		
	}
}


module.exports = NodesNetManager;
