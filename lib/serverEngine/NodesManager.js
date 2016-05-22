"use strict";

/*
 Nodes Manager
 
 - Provides nodes management
 - Manage event [NodeAdded]
 - Manage message [getNodeInfo]->[NodeInfo] and set configuration of node
 - Manage event [NodeDisconnected]
 - Shutdown node
 
 */


let EventEmitter = require('events').EventEmitter;

/**
 * NodesManager_CONSTANTS
 */
const NodesManager_CONSTANTS = {
		
		"States" : {
			"Setup" : "Setup",
			"Ready" : "Ready"
			
		},
		
		"Events" : {
			"NodeDisconnected": "Node Disconnected",
			"NodeRemoved": "Node Removed",
			"NodeAdded": "Node Added"


		},
		
		"Messages" : {
			"getNodeInfo" : "Get Node Info",
			"NodeInfo" : "Node Info",
			"BadNodeConfig" : "Bad Node Config",
			
			"ShutDownNode" : "ShutDownNode"

		}
};


/**
 * ST Node
 */
class Node {
	
	
	constructor(config, socket) {
		
		this.state = null;
		
		this.config = config;
		this.socket = socket;
		
		this.eventEmitter = new EventEmitter();

		this.CONSTANTS = NodesManager_CONSTANTS;
		
		this.mapSocketEvents();
		this.mapSocketMessages();

		if (this.config == null) {
			this.state = this.CONSTANTS.States.Setup;
			this.socket.emit( this.CONSTANTS.Messages.getNodeInfo );	// Emit message getNodeInfo
		}
		
		
	}
	
	/**
	 * Map socket events
	 */
	mapSocketEvents() {
		
		let node = this;
		
		// Map event disconnect
		node.socket.on('disconnect', function(){
			node.eventEmitter.emit( node.CONSTANTS.Events.NodeDisconnected , {"node" : node} );	// Emit event NodeDisconnected
		  });
		

	}
	
	
	/**
	 * Map socket messages
	 */
	mapSocketMessages() {
		
		let node = this;
		
		// Map message NodeInfo
		node.socket.on(node.CONSTANTS.Messages.NodeInfo, function(msg){
			
			console.log('<*> ST Node.Messages.NodeInfo');	// TODO REMOVE DEBUG LOG
			console.log(msg);	// TODO REMOVE DEBUG LOG
			
			node.config = msg;
			  
			// Emit event NodeAdded
			node.eventEmitter.emit( node.CONSTANTS.Events.NodeAdded , {"node" : node} );

		});
		
	}
	
}


/**
 * ST Nodes Manager
 */
class NodesManager {
	
	constructor() {
		this.nodeList = [];
		
		this.eventEmitter = new EventEmitter();

		
		this.CONSTANTS = NodesManager_CONSTANTS;

	}
	
	/**
	 * Add ST Node
	 */
	addNode(config, socket) {
		
		let stNode = new Node(config, socket);
		let ndm = this;
		
		// Map Event NodeAdded
		stNode.eventEmitter.on( stNode.CONSTANTS.Events.NodeAdded, function(data){
			
			ndm._event_NodeAdded(data, stNode);
		});
		
		
		// Map Event NodeDisconnected		
		stNode.eventEmitter.on( stNode.CONSTANTS.Events.NodeDisconnected, function(data){
		
			ndm._event_NodeDisconnected(data, stNode);
		});

		
		ndm.nodeList.push(stNode);
	
	}
	
	
	/**
	 * Returns Node searched by ID
	 */
	getNodeByID(nodeID, state) {
		
		let ndm = this;
		let nodesList = ndm.nodeList;
		
		let node = null;
		let _i = -1;
		
		if (state == undefined) {
			state = NodesManager_CONSTANTS.States.Ready;
		}
		
		
		_i = nodesList.map(function(x) {return x.config.nodeID; }).indexOf(nodeID);
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
		}
	}
	
	
	/**
	 * Returns Node searched by Socket
	 */
	getNodeBySocket(socket) {

		let ndm = this;
		let nodesList = ndm.nodeList;
		
		let node = null;
		let _i = 0;
		
		_i = nodesList.map(function(x) {return x.socket.id; }).indexOf(socket.id);
		if (_i != -1) {
			node = nodesList[_i];
		}
		
		return {
			"stNode": node,
			"position": _i
		}
	}
	
	
	/**
	 * ShutDown Node
	 */
	shutDownNode(nodeID) {
		let ndm = this;
		
		let nodeSearch = ndm.getNodeByID(nodeID);
		if (nodeSearch.stNode != null ){
			nodeSearch.stNode.socket.emit( ndm.CONSTANTS.Messages.ShutDownNode );	// Emit message ShutDownNode
		}
	}
	
	
	/**
	 * Event NodeAdded
	 */
	_event_NodeAdded(data, stNode) {
		
		let ndm = this;
		
		let nodeSearch = ndm.getNodeByID( data.node.config.nodeID );
		if (nodeSearch.stNode != null &&
				nodeSearch.stNode.state == ndm.CONSTANTS.States.Ready) {
			
			// Emit message BadNodeConfig
			stNode.socket.emit(ndm.CONSTANTS.Messages.BadNodeConfig, {
				"message" : "nodeID duplicated."
			});
			
		} else {
			data.node.state = ndm.CONSTANTS.States.Ready;
			ndm.eventEmitter.emit( ndm.CONSTANTS.Events.NodeAdded, data );	// Emit event NodeAdded

		}
	}
	
	
	/**
	 * Event NodeDisconnected
	 */
	_event_NodeDisconnected(data, stNode) {
		
		let ndm = this;
		
		let nodeSearh = ndm.getNodeBySocket(data.node.socket);
		
		if (nodeSearh.stNode != null) {
			ndm.nodeList.splice(nodeSearh.position, 1);
			ndm.eventEmitter.emit( ndm.CONSTANTS.Events.NodeRemoved );	// Emit event NodeRemoved
		}
		
	}

}


module.exports = NodesManager;