"use strict";

/*
 Server configuration

 - Provides server configuration.
 - Load configuration from file

*/



/**
 * ServerConfiguration CONSTANTS
 */
const ServerConfiguration_CONSTANTS = {
	"configFile" : "conf/serverconfig.json"
};




/**
 * The ServerConfiguration JSON file.
 * 
 * @typedef {Object} ServerConfig_JSON
 * @memberof ServerConfiguration
 * @type Object
 * 
 * @property {string} type='Config' - Type on JSON
 * @property {string} typeExtra='Server' - Type extra on JSON
 * 
 * 
 * @property {object} nodes - Nodes configuration
 * @property {string} nodes.netLocation - Net location for nodes control service... 
 * <pre>
 * "0.0.0.0" for all interfaces...
 * </pre>
 * @property {number} nodes.controlPort - Control port
 * 
 * 
 * @property {object} server - Server configuration
 * @property {string} server.netLocation - Net location for server control service
 * @property {number} server.controlPort - Control port
 * 
 * 
 */



/**
 * ServerConfiguration
 * 
 * @class 
 * 
 * @property {object} config - Configuration obejct
 * 
 */
class ServerConfiguration {
	
	/**
	 * @constructs ServerConfiguration
	 */
	constructor() {
		this.config = null;
		this.CONSTANTS = ServerConfiguration_CONSTANTS;
	}
	
	/**
	 * Read configuration from file
	 */
	readFile() {
		var fs = require('fs');
		
		try {
			var obj = JSON.parse(fs.readFileSync(ServerConfiguration_CONSTANTS.configFile, 'utf8'));
			this.config = obj;
		} catch (e) {
			// TODO: handle exception
			console.log('ServerConfiguration.readFile Error');	// TODO REMOVE DEBUG LOG
			console.log(e.message);	// TODO REMOVE DEBUG LOG

		}
		
		console.log('ServerConfiguration.readFile OK');	// TODO REMOVE DEBUG LOG

    }
}

module.exports = ServerConfiguration;


