"use strict";

/*
 Server configuration

 - Provides server configuration.
 - Load configuration from file

*/



//const fs = require('fs');

const ServerConfiguration_CONSTANTS = {
	"configFile" : "conf/serverconfig.json"
};


class ServerConfiguration {
	
	
	constructor() {
		this.config = null;
		this.CONSTANTS = ServerConfiguration_CONSTANTS;
	}
	
	readFile() {
		var fs = require('fs');
		
		try {
			var obj = JSON.parse(fs.readFileSync(ServerConfiguration_CONSTANTS.configFile, 'utf8'));
			this.config = obj;
		} catch (e) {
			// TODO: handle exception
			console.log('ServerConfiguration.readFile Error');	// TODO OC REMOVE DEBUG LOG
			console.log(e.message);	// TODO OC REMOVE DEBUG LOG

		}
		
		console.log('ServerConfiguration.readFile OK');	// TODO OC REMOVE DEBUG LOG

    }
}

module.exports = ServerConfiguration;


