"use strict";

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
		
		this.eventEmitter.on( this.CONSTANTS.Events.MainLoop_Stop, function() {
			clearInterval( dataChannel._mainLoop );
			dataChannel.state = dataChannel.CONSTANTS.States.DCstate_Ready;
		});
	}
	
	
	/**
	 * Initialize data channel
	 */
	initDataChannel() {
		if (this.state != this.CONSTANTS.States.DCstate_Config) {
			throw "Bad channel state";
		}
		
	}
	
	
	/**
	 * Start data channel
	 */
	startDataChannel() {
		if ( this.state != this.CONSTANTS.States.DCstate_Config || 
				this.state != this.CONSTANTS.States.DCstate_Stop ) {
			throw "Bad channel state";
		}
		
		this.eventEmitter.emit(this.CONSTANTS.Events.ChannelStart);
	}
	
	
	/**
	 * Stop data channel
	 */
	stopDataChannel() {
		if (this.state != this.CONSTANTS.States.DCstate_Ready) {
			throw "Bad channel state";
		}
		
		this.eventEmitter.emit(this.CONSTANTS.Events.ChannelStop);
	}
	
	
	/**
	 * Send message
	 */
	sendMessage(msg) {
		var dataMSG = new DataMessage(msg);
		this.messagesList.push(dataMSG);
	}
	
	
	/**
	 * Main loop
	 */
	mainLoop() {
	  let dataChannel = this;
	  
	  if ( dataChannel.state == dataChannel.CONSTANTS.States.DCstate_Ready ) {
		  throw "Bad channel state";
	  }
	  
	  dataChannel.state == dataChannel.CONSTANTS.States.DCstate_Working;
	  
	  dataChannel._mainLoop = setInterval(() => {
		  if (dataChannel.state == dataChannel.CONSTANTS.States.DCstate_Working) {
			  dataChannel.eventEmitter.emit(dataChannel.CONSTANTS.Events.MainLoop_Tick);
		  } else {
			  dataChannel.eventEmitter.emit(dataChannel.CONSTANTS.Events.MainLoop_Stop);
		  }
	  }, dataChannel.config.loopTime);
	  
	}
	
	
	/**
	 * Stop main loop
	 */
	stopMainLoop() {
		this.eventEmitter.emit(this.CONSTANTS.Events.MainLoop_Stop);
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
		
		var dataChannel = null;
		
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
		
		if (dch.config.id == undefined || 
				dch.config.id == null) {
			throw "Channel needs ID.";
		}
		
		let dchSearch = this.getDataChannelByID(dch.config.id);
		if (dchSearch.dataChannel != null){
			throw "Duplicated channel ID.";
		}
		
		this.channelsList.push(dch);
		
		this.eventEmitter.emit( this.CONSTANTS.Events.DataChannelAdded, dch.config.id);
	}
	
	
	/**
	 * Remove data channel
	 */
	removeDataChannel(dchID) {
		let dchSearch = this.getDataChannelByID(dchID);
		if (dchSearch.dataChannel == null){
			throw "Channel not found.";
		}
		this.channelsList.splice(dchSearch.position, 1);
		
		this.eventEmitter.emit( this.CONSTANTS.Events.DataChannelRemoved );
	}
	
	
	/**
	 * Returns data channel searched by id
	 */
	getDataChannelByID(dchID) {
		let dch = null;
		
		var _i = 0;
		for (_i = 0; _i < this.channelsList.length; _i++) {
			
			if (this.channelsList[_i].config.id == dchID) {
				dch = this.channelsList[_i];
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