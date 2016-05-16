/**
 * SomeThings Server
 * 
 * starts a STServer
 */


// Gulp+Babel tricks · · - - · · · - - · \/ · ·
if (!process.argv[2] || 
		process.argv[2] != 'dev') {
	
	var gulp_babelTricks = require('./toES5.js');
	gulp_babelTricks.source_map_support_Install();
	
} else {
	console.log('Running in Dev mode...');	// TODO REMOVE DEBUG LOG
	console.log('Arguments');	// TODO REMOVE DEBUG LOG
	console.log(process.argv);	// TODO REMOVE DEBUG LOG
}
// · - - · · · - - · · · - - · · · - - · /\ · ·


// require our modules
const STServer = require('./serverEngine/ST_Server.js');


/**
 * ST Server Main loop
 */
var stServer = new STServer();
try {
	stServer.init_Server();
	stServer.init_NodesControlService();

	stServer.init_NodesNetManager();
	stServer.init_NodesNetService();

	stServer.init_ServerControlService();
	
	stServer.init_MiniCLI();
} catch (e) {
	// TODO: handle exception
	console.log("Something happens.");
	console.log(e);
}



