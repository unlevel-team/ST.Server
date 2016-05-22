"use strict";

/**
 * DataChannel library
 * 
 * Provides data channels to ST network
 * 
 * 
 */


let EventEmitter = require('events').EventEmitter;
let net = require('net');


/**
 * DataChannel CONSTANTS
 */
const DataChannel_CONSTANTS = {
		"Config" : {
			"DCtype_socketio" : "socketio",
			"DCtype_udp" : "udp",
			
			"MSGType_Normal" : "normal",
			"DataType_JSON" : "json",
			
			
			"modeIN" : "input",
			"modeOUT" : "output"

		},
		
		"States" : {
			"DCstate_Config" : "config",
			"DCstate_Ready" : "ready",
			"DCstate_Working" : "working",
			"DCstate_Stop" : "stop"
		},
		
		"Events" : {
			"ChannelInitialized" : "Channel initialized",
			"ChannelStart" : "Channel start",
			"ChannelStarted" : "Channel started",
			"ChannelStop" : "Channel stop",
			"ChannelStopped" : "Channel stopped",
			"ClientConnected" : "Client Connected",
			"ClientDisconnected" : "Client Disconnected",
			
			"MainLoop_Tick" : "Main Loop",
			"MainLoop_Stop" : "Main Loop Stop",
			
			"MessageReceived" : "DataMSG",
			
			"DataChannelAdded" : "DCH Added",
			"DataChannelRemoved" : "DCH Removed",


		},
		
		"Messages" : {
			"DataMessage": "DataMSG"
		}
	};


/**
 * Data message
 */
class DataMessage {
	
	constructor(msg) {
		this.type = DataChannel_CONSTANTS.Config.MSGType_Normal;
		this.typeExtra = null;
		this.dataType = DataChannel_CONSTANTS.Config.DataType_JSON;
		this.msg = msg;
		
		this.CONSTANTS = DataChannel_CONSTANTS;
	}
	
}

/**
 * Data channel
 */
class DataChannel {
	
	constructor(config) {
		
		this.messagesList = [];
		this.eventEmitter = new EventEmitter();
		
		this.CONSTANTS = DataChannel_CONSTANTS;
		
		this.server = null;
		this.socket = null;

		this._mainLoop = null;
		
		this.config = config;
		
		this.state = DataChannel_CONSTANTS.States.DCstate_Config;
		
		
		let dataChannel = this;
		
		// Map event MainLoop_Stop
		this.eventEmitter.on( this.CONSTANTS.Events.MainLoop_Stop, function() {
			clearInterval( dataChannel._mainLoop );
			dataChannel.state = dataChannel.CONSTANTS.States.DCstate_Ready;
		});
	}
	
	
	/**
	 * Initialize data channel
	 */
	initDataChannel() {
		
		let dc = this;
		
		if (dc.state != dc.CONSTANTS.States.DCstate_Config) {
			throw "Bad channel state";
		}
		
	}
	
	
	/**
	 * Start data channel
	 */
	startDataChannel() {
		
		let dc = this;
		
		if ( dc.state != dc.CONSTANTS.States.DCstate_Config || 
				dc.state != dc.CONSTANTS.States.DCstate_Stop ) {
			throw "Bad channel state";
		}
		
		dc.eventEmitter.emit(dc.CONSTANTS.Events.ChannelStart);	// Emit event ChannelStart
	}
	
	
	/**
	 * Stop data channel
	 */
	stopDataChannel() {
		
		let dc = this;
		
		if (dc.state != dc.CONSTANTS.States.DCstate_Ready) {
			throw "Bad channel state";
		}
		
		dc.eventEmitter.emit(dc.CONSTANTS.Events.ChannelStop);	// Emit event ChannelStop
	}
	
	
	/**
	 * Send message
	 */
	sendMessage(msg) {
		
		let dc = this;
		
		let dataMSG = new DataMessage(msg);
		dc.messagesList.push(dataMSG);
	}
	
	
	/**
	 * Main loop
	 */
	mainLoop() {
		
	  let dc = this;
	  
	  if ( dc.state == dc.CONSTANTS.States.DCstate_Ready ) {
		  throw "Bad channel state";
	  }
	  
	  dc.state == dc.CONSTANTS.States.DCstate_Working;
	  
	  dc._mainLoop = setInterval(() => {
		  if (dc.state == dc.CONSTANTS.States.DCstate_Working) {
			  dc.eventEmitter.emit(dc.CONSTANTS.Events.MainLoop_Tick);	// Emit event MainLoop_Tick
		  } else {
			  dc.eventEmitter.emit(dc.CONSTANTS.Events.MainLoop_Stop);	// Emit event MainLoop_Stop
		  }
	  }, dc.config.loopTime);
	  
	}
	
	
	/**
	 * Stop main loop
	 */
	stopMainLoop() {
		
		let dc = this;
		
		dc.eventEmitter.emit(dc.CONSTANTS.Events.MainLoop_Stop);	// Emit event MainLoop_Stop
	}
	
}


/**
 * Data channels manager
 */
class DataChannelsManager {
	
	constructor() {
		this.channelsList = [];
		this.eventEmitter = new EventEmitter();
		
		this.CONSTANTS = DataChannel_CONSTANTS;
	}
	
	
	/**
	 * Get Data channel
	 */
	static get_DataChannel(config) {
		
		let dataChannel = null;
		
		switch (config.type) {
		case DataChannel_CONSTANTS.Config.DCtype_socketio:
			let DC_SocketIO = require('./DC_SocketIO.js');
			dataChannel = new DC_SocketIO(config);
			break;

		default:
			break;
		}
		
		return dataChannel;
		
	}
	
	
	/**
	 * Returns Messages searched by Message.typeExtra
	 */
	static getMessagesByTypeExtra(typeExtra, msgList) {
		
		var messages = msgList.filter(function(msg, _i, _items) {
			
			if (msg.typeExtra == typeExtra) {
				return true;
			}
			
		});
		
		return {
			"numMessages": messages.length,
			"messages": messages
		}
		
	}
	
	
	/**
	 * Add data channel
	 */
	addDataChannel(dch) {
		
		let dcm = this;
		
		if (dch.config.id == undefined || 
				dch.config.id == null) {
			throw "Channel needs ID.";
		}
		
		let dchSearch = dcm.getDataChannelByID(dch.config.id);
		if (dchSearch.dataChannel != null){
			throw "Duplicated channel ID.";
		}
		
		dcm.channelsList.push(dch);
		
		dcm.eventEmitter.emit( dcm.CONSTANTS.Events.DataChannelAdded, dch.config.id);	// Emit event DataChannelAdded
	}
	
	
	/**
	 * Remove data channel
	 */
	removeDataChannel(dchID) {
		
		let dcm = this;
		
		let dchSearch = dcm.getDataChannelByID(dchID);
		if (dchSearch.dataChannel == null){
			throw "Channel not found.";
		}
		
		let dataChannel = dchSearch.dataChannel;
		
		if (dataChannel.state == dcm.CONSTANTS.States.DCstate_Working) {
			throw "Bad channel state.";
		}
		
		dcm.channelsList.splice(dchSearch.position, 1);
		
		dcm.eventEmitter.emit( dcm.CONSTANTS.Events.DataChannelRemoved, dchID);	// Emit event DataChannelRemoved
	}
	
	
	/**
	 * Returns data channel searched by id
	 */
	getDataChannelByID(dchID) {
		
		let dcm = this;
		let dch = null;
		
		var _i = 0;
		for (_i = 0; _i < dcm.channelsList.length; _i++) {
			
			if (dcm.channelsList[_i].config.id == dchID) {
				dch = dcm.channelsList[_i];
				break;
			}
		}
		
		return {
			"dataChannel": dch,
			"position": _i
		}
	}
	
}


var dataChannel_Lib = {
	"CONSTANTS" : DataChannel_CONSTANTS,
	"DataChannel" : DataChannel,
	"DataMessage" : DataMessage,
	"DataChannelsManager": DataChannelsManager
};

module.exports = dataChannel_Lib;