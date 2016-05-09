"use strict";

/*
 Server Net manager
 
 - Provides net management for server.
 - Add data channel to server
 - Remove data channel from server
 - Get data channels of server
 
 
 */


let DataChannelsManager = require('../stNetwork/DataChannel.js').DataChannelsManager;



/**
 * Server net manager
 */
class ServerNetManager extends DataChannelsManager {
	
	
	constructor(config) {
		super();
		this.config = config;

	}
	
	/**
	 * Add data channel to server
	 */
	addDataChannelToServer(dchID, config) {
		
		let snetm = this;
		let server = setm.config._server;
		
		var dch_Config = {
			id: dchID,
			type: nnetm.CONSTANTS.Config.DCtype_socketio,
			_netState: nnetm.CONSTANTS.Config.DCstate_Config
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
			
		}
		// · · · ^^^ · · ·  ^^^ · · ·  ^^^ · · · ^^^ · · ·  ^^^ · |/\|··· 

		
		var dch = this.get_DataChannel(dch_Config);
		
		this.addDataChannel(dch);
	}
	
}


module.exports = ServerNetManager;
