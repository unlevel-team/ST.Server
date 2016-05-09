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
			this.socket.emit( this.CONSTANTS.Messages.getNodeInfo );
		}
		
		
	}
	
	/**
	 * Map socket events
	 */
	mapSocketEvents() {
		
		var node = this;
		
		node.socket.on('disconnect', function(){
			node.eventEmitter.emit( node.CONSTANTS.Events.NodeDisconnected , {"node" : node} );
		  });
		

	}
	
	/**
	 * Map socket messages
	 */
	mapSocketMessages() {
		var node = this;
		
		node.socket.on(node.CONSTANTS.Messages.NodeInfo, function(msg){
			  console.log('<*> ST Node.Messages.NodeInfo');	// TODO REMOVE DEBUG LOG
			  console.log(msg);	// TODO REMOVE DEBUG LOG
			
			  node.config = msg;
			  
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
		
		var stNode = new Node(config, socket);
		let ndm = this;
		
	  // · · · · · ·  # #  · · · · · ·  ###  · · · · · ·  # # · · · · · · |\/|···  
	  // Event NodeAdded
		stNode.eventEmitter.on( stNode.CONSTANTS.Events.NodeAdded, function(data){
			
			let nodeSearch = ndm.getNodeByID( data.node.config.nodeID );
			if (nodeSearch.stNode != null ) {
				
				stNode.socket.emit(ndm.CONSTANTS.Messages.BadNodeConfig, {
					"message" : "nodeID duplicated."
				});
				
			} else {
				data.node.state = ndm.CONSTANTS.States.Ready;
				ndm.eventEmitter.emit( ndm.CONSTANTS.Events.NodeAdded, data );	// Emit event NodeAdded

			}
			
			
		});
	  // · · · · · ·  # #  · · · · · ·  ###  · · · · · ·  # # · · · · · · |/\|···  
		
	  // · · · · · ·  # #  · · · · · ·  ###  · · · · · ·  # # · · · · · · |\/|···  
	  // Event NodeDisconnected		
		stNode.eventEmitter.on( stNode.CONSTANTS.Events.NodeDisconnected, function(data){
			
			let nodeSearh = ndm.getNodeBySocket(data.node.socket);
			
			if (nodeSearh.stNode != null) {
				ndm.nodeList.splice(nodeSearh.position, 1);
				ndm.eventEmitter.emit( ndm.CONSTANTS.Events.NodeRemoved );	// Emit event NodeRemoved
			}
			
		});
	  // · · · · · ·  # #  · · · · · ·  ###  · · · · · ·  # # · · · · · · |/\|···  

		
		this.nodeList.push(stNode);
	
	}
	
	
	/**
	 * Returns Node searched by ID
	 */
	getNodeByID(nodeID, state) {

		var node = null;
		var _i = 0;
		
		if (state == undefined) {
			state = NodesManager_CONSTANTS.States.Ready;
		}
		
		for (_i = 0; _i < this.nodeList.length; _i++) {
			if (this.nodeList[_i].config.nodeID == nodeID && 
					this.nodeList[_i].state == state) {
				node = this.nodeList[_i];
				break;
			}
		}
		
		return {
			"stNode": node,
			"position": _i
		}
	}
	
	
	/**
	 * Returns Node searched by Socket
	 */
	getNodeBySocket(socket) {

		var node = null;
		var _i = 0;
		
		for (_i = 0; _i < this.nodeList.length; _i++) {
			if (this.nodeList[_i].socket.id == socket.id) {
				node = this.nodeList[_i];
				break;
			}
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
			nodeSearch.stNode.socket.emit( ndm.CONSTANTS.Messages.ShutDownNode );	// Emit event ShutDownNode
		}
	}

}


module.exports = NodesManager;