'use strict';

/**
 * SomeThings Server engine
 * 
 * starts a STServer
 */

/**
 * SomeThins project
 * 
 * @namespace st
 */

/**
 * SomeThings Node Engine
 * 
 * @namespace st.serverEngine
 * @memberof  st
 * 
 */

// Gulp+Babel tricks ~ ~ - - ~ ~ ~ - - ~ \/ ~ ~
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
// ~ - - ~ ~ ~ - - ~ ~ ~ - - ~ ~ ~ - - ~ /\ ~ ~

// Parse arguments
var _sliceIndex = 2;
if (devMode === true) {
	_sliceIndex++;
}

var _argv = require('minimist')(process.argv.slice(_sliceIndex));
console.log(_argv); // TODO REMOVE DEBUG LOG

/**
 * import STServer
 * @ignore
 */
var STServer = require('./serverEngine/ST_Server.js');

// Set server options
var _sOptions = {
	'config': {
		'devMode': devMode,
		'argv': _argv
	}
};

if (_argv.configfile !== undefined) {
	_sOptions.config.configfile = _argv.configfile;
}

/**
 * ST Server Main loop
 * @ignore
 */
var stServer = new STServer(_sOptions);

try {

	try {
		stServer.init_Server();
	} catch (e) {
		// TODO: handle exception
		throw "Cannot initialize ST Server." + e;
	}

	try {
		stServer.init_STNetwork();
	} catch (e) {
		// TODO: handle exception
		throw "Cannot start ST Networrk. " + e;
	}

	try {
		stServer.init_ServerControlService();
	} catch (e) {
		// TODO: handle exception
		throw "Cannot start ServerControlService. " + e;
	}

	try {
		stServer.init_MiniCLI();
	} catch (e) {
		// TODO: handle exception
		throw "Cannot start miniCLI. " + e;
	}
} catch (e) {

	// TODO: handle exception
	console.log("Something happens.");
	console.log(e);
}
//# sourceMappingURL=STServerEngine.js.map
