"use strict";

/*
 Server configuration

 - Provides server configuration.
 - Load configuration from file

*/

//const fs = require('fs');

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ServerConfiguration_CONSTANTS = {
	"configFile": "conf/serverconfig.json"
};

var ServerConfiguration = function () {
	function ServerConfiguration() {
		_classCallCheck(this, ServerConfiguration);

		this.config = null;
		this.CONSTANTS = ServerConfiguration_CONSTANTS;
	}

	_createClass(ServerConfiguration, [{
		key: "readFile",
		value: function readFile() {
			var fs = require('fs');

			try {
				var obj = JSON.parse(fs.readFileSync(ServerConfiguration_CONSTANTS.configFile, 'utf8'));
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
