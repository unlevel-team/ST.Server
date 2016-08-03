"use strict";

/*
 Server configuration

 - Provides server configuration.
 - Load configuration from file

*/

/**
 * ServerConfiguration CONSTANTS
 * @memberof st.serverEngine
 */

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ServerConfiguration_CONSTANTS = {
	"configFile": "conf/serverconfig.json"
};

/**
 * The ServerConfiguration JSON file.
 * 
 * @typedef {Object} ServerConfig_JSON
 * @memberof st.serverEngine.ServerConfiguration
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
 * @memberof st.serverEngine
 * 
 * @property {object} config - Configuration obejct
 * 
 */

var ServerConfiguration = function () {

	/**
  * @constructs ServerConfiguration
  */

	function ServerConfiguration() {
		_classCallCheck(this, ServerConfiguration);

		this.config = null;
		this.CONSTANTS = ServerConfiguration_CONSTANTS;
	}

	/**
  * Read configuration from file
  * 
  * @param {object} options - Options object
  * @param {string} [options.configFile] - configuration file path
  * 
  */


	_createClass(ServerConfiguration, [{
		key: "readFile",
		value: function readFile(options) {

			if (options === undefined) {
				options = {};
			}

			var _configFile = ServerConfiguration_CONSTANTS.configFile;
			if (options.configFile !== undefined) {
				_configFile = options.configFile;
			}

			var fs = require('fs');

			try {
				var obj = JSON.parse(fs.readFileSync(_configFile, 'utf8'));
				this.config = obj;
			} catch (e) {
				// TODO: handle exception
				console.log('ServerConfiguration.readFile Error'); // TODO REMOVE DEBUG LOG
				console.log(e.message); // TODO REMOVE DEBUG LOG
			}

			console.log('ServerConfiguration.readFile OK'); // TODO REMOVE DEBUG LOG
		}
	}]);

	return ServerConfiguration;
}();

module.exports = ServerConfiguration;
//# sourceMappingURL=ServerConfiguration.js.map
