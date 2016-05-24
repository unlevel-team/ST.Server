'use strict';

/**
 * SomeThings Server
 * 
 * starts a STServer
 */

// Gulp+Babel tricks · · - - · · · - - · \/ · ·
var devMode = false;

if (!process.argv[2] || process.argv[2] !== 'dev') {

	var gulp_babelTricks = require('./toES5.js');
	gulp_babelTricks.source_map_support_Install();
} else {
	devMode = true;
	console.log('Running in Dev mode...'); // TODO REMOVE DEBUG LOG
	console.log('Arguments'); // TODO REMOVE DEBUG LOG
	console.log(process.argv); // TODO REMOVE DEBUG LOG
}
// · - - · · · - - · · · - - · · · - - · /\ · ·

// require our modules
var STServer = require('./serverEngine/ST_Server.js');

/**
 * ST Server Main loop
 */
var stServer = new STServer();
try {

	stServer._devMode = devMode;

	stServer.init_Server();
	stServer.init_NodesControlService();

	stServer.init_NodesNetManager();
	stServer.init_NodesNetService();

	try {
		stServer.init_ServerCOMSystem();
	} catch (e) {
		// TODO: handle exception
		throw "Cannot start ServerCOMSystem" + e;
	}

	try {
		stServer.init_ServerControlService();
	} catch (e) {
		// TODO: handle exception
		throw "Cannot start ServerControlService" + e;
	}

	try {
		stServer.init_MiniCLI();
	} catch (e) {
		// TODO: handle exception
		throw "Cannot start miniCLI" + e;
	}
} catch (e) {

	// TODO: handle exception
	console.log("Something happens.");
	console.log(e);
}
//# sourceMappingURL=STServerEngine.js.map
