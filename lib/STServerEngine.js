/**
 * SomeThings Server engine
 * 
 * starts a STServer
 */


// Gulp+Babel tricks ~ ~ - - ~ ~ ~ - - ~ \/ ~ ~
var devMode = false;

if (!process.argv[2] || 
		process.argv[2] !== 'dev') {
	
	var gulp_babelTricks = require('./toES5.js');
	gulp_babelTricks.source_map_support_Install();
	
} else {
	devMode = true;
	console.log('Running in Dev mode...');	// TODO REMOVE DEBUG LOG
	console.log('Arguments');	// TODO REMOVE DEBUG LOG
	console.log(process.argv);	// TODO REMOVE DEBUG LOG
}
// ~ - - ~ ~ ~ - - ~ ~ ~ - - ~ ~ ~ - - ~ /\ ~ ~


/**
 * import STServer
 * @ignore
 */
const STServer = require('./serverEngine/ST_Server.js');


/**
 * ST Server Main loop
 * 
 * @ignore
 */
var stServer = new STServer();
try {
	
	stServer._devMode = devMode;
	
	stServer.init_Server();

	try {
		stServer.init_STNetwork();
	} catch (e) {
		// TODO: handle exception
		throw "Cannot start ST Networrk" + e;
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



