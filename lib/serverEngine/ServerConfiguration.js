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
			console.log('ServerConfiguration.readFile Error');	// TODO REMOVE DEBUG LOG
			console.log(e.message);	// TODO REMOVE DEBUG LOG

		}
		
		console.log('ServerConfiguration.readFile OK');	// TODO REMOVE DEBUG LOG

    }
}

module.exports = ServerConfiguration;


