"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var EventEmitter = require('events').EventEmitter;
var net = require('net');

/**
 * DataChannel CONSTANTS
 */
var DataChannel_CONSTANTS = {
	"Config": {
		"DCtype_socketio": "socketio",
		"DCtype_udp": "udp",

		"MSGType_Normal": "normal",
		"DataType_JSON": "json",

		"modeIN": "input",
		"modeOUT": "output"

	},

	"States": {
		"DCstate_Config": "config",
		"DCstate_Ready": "ready",
		"DCstate_Working": "working",
		"DCstate_Stop": "stop"
	},

	"Events": {
		"ChannelInitialized": "Channel initialized",
		"ChannelStart": "Channel start",
		"ChannelStarted": "Channel started",
		"ChannelStop": "Channel stop",
		"ChannelStopped": "Channel stopped",
		"ClientConnected": "Client Connected",
		"ClientDisconnected": "Client Disconnected",

		"MainLoop_Tick": "Main Loop",
		"MainLoop_Stop": "Main Loop Stop",

		"MessageReceived": "DataMSG",

		"DataChannelAdded": "DCH Added",
		"DataChannelRemoved": "DCH Removed"

	},

	"Messages": {
		"DataMessage": "DataMSG"
	}
};

/**
 * Data message
 */

var DataMessage = function DataMessage(msg) {
	_classCallCheck(this, DataMessage);

	this.type = DataChannel_CONSTANTS.Config.MSGType_Normal;
	this.typeExtra = null;
	this.dataType = DataChannel_CONSTANTS.Config.DataType_JSON;
	this.msg = msg;

	this.CONSTANTS = DataChannel_CONSTANTS;
};

/**
 * Data channel
 */


var DataChannel = function () {
	function DataChannel(config) {
		_classCallCheck(this, DataChannel);

		this.messagesList = [];
		this.eventEmitter = new EventEmitter();

		this.CONSTANTS = DataChannel_CONSTANTS;

		this.server = null;
		this.socket = null;

		this._mainLoop = null;

		this.config = config;

		this.state = DataChannel_CONSTANTS.States.DCstate_Config;

		var dataChannel = this;

		this.eventEmitter.on(this.CONSTANTS.Events.MainLoop_Stop, function () {
			clearInterval(dataChannel._mainLoop);
			dataChannel.state = dataChannel.CONSTANTS.States.DCstate_Ready;
		});
	}

	/**
  * Initialize data channel
  */


	_createClass(DataChannel, [{
		key: 'initDataChannel',
		value: function initDataChannel() {
			if (this.state != this.CONSTANTS.States.DCstate_Config) {
				throw "Bad channel state";
			}
		}

		/**
   * Start data channel
   */

	}, {
		key: 'startDataChannel',
		value: function startDataChannel() {
			if (this.state != this.CONSTANTS.States.DCstate_Config || this.state != this.CONSTANTS.States.DCstate_Stop) {
				throw "Bad channel state";
			}

			this.eventEmitter.emit(this.CONSTANTS.Events.ChannelStart);
		}

		/**
   * Stop data channel
   */

	}, {
		key: 'stopDataChannel',
		value: function stopDataChannel() {
			if (this.state != this.CONSTANTS.States.DCstate_Ready) {
				throw "Bad channel state";
			}

			this.eventEmitter.emit(this.CONSTANTS.Events.ChannelStop);
		}

		/**
   * Send message
   */

	}, {
		key: 'sendMessage',
		value: function sendMessage(msg) {
			var dataMSG = new DataMessage(msg);
			this.messagesList.push(dataMSG);
		}

		/**
   * Main loop
   */

	}, {
		key: 'mainLoop',
		value: function mainLoop() {
			var dataChannel = this;

			if (dataChannel.state == dataChannel.CONSTANTS.States.DCstate_Ready) {
				throw "Bad channel state";
			}

			dataChannel.state == dataChannel.CONSTANTS.States.DCstate_Working;

			dataChannel._mainLoop = setInterval(function () {
				if (dataChannel.state == dataChannel.CONSTANTS.States.DCstate_Working) {
					dataChannel.eventEmitter.emit(dataChannel.CONSTANTS.Events.MainLoop_Tick);
				} else {
					dataChannel.eventEmitter.emit(dataChannel.CONSTANTS.Events.MainLoop_Stop);
				}
			}, dataChannel.config.loopTime);
		}

		/**
   * Stop main loop
   */

	}, {
		key: 'stopMainLoop',
		value: function stopMainLoop() {
			this.eventEmitter.emit(this.CONSTANTS.Events.MainLoop_Stop);
		}
	}]);

	return DataChannel;
}();

/**
 * Data channels manager
 */


var DataChannelsManager = function () {
	function DataChannelsManager() {
		_classCallCheck(this, DataChannelsManager);

		this.channelsList = [];
		this.eventEmitter = new EventEmitter();

		this.CONSTANTS = DataChannel_CONSTANTS;
	}

	/**
  * Get Data channel
  */


	_createClass(DataChannelsManager, [{
		key: 'addDataChannel',


		/**
   * Add data channel
   */
		value: function addDataChannel(dch) {

			if (dch.config.id == undefined || dch.config.id == null) {
				throw "Channel needs ID.";
			}

			var dchSearch = this.getDataChannelByID(dch.config.id);
			if (dchSearch.dataChannel != null) {
				throw "Duplicated channel ID.";
			}

			this.channelsList.push(dch);

			this.eventEmitter.emit(this.CONSTANTS.Events.DataChannelAdded, dch.config.id);
		}

		/**
   * Remove data channel
   */

	}, {
		key: 'removeDataChannel',
		value: function removeDataChannel(dchID) {

			var dchnm = this;

			var dchSearch = dchnm.getDataChannelByID(dchID);
			if (dchSearch.dataChannel == null) {
				throw "Channel not found.";
			}

			var dataChannel = dchSearch.dataChannel;

			if (dataChannel.state == dchnm.CONSTANTS.States.DCstate_Working) {
				throw "Bad channel state.";
			}

			dchnm.channelsList.splice(dchSearch.position, 1);

			dchnm.eventEmitter.emit(dchnm.CONSTANTS.Events.DataChannelRemoved, dchID);
		}

		/**
   * Returns data channel searched by id
   */

	}, {
		key: 'getDataChannelByID',
		value: function getDataChannelByID(dchID) {
			var dch = null;

			var _i = 0;
			for (_i = 0; _i < this.channelsList.length; _i++) {

				if (this.channelsList[_i].config.id == dchID) {
					dch = this.channelsList[_i];
					break;
				}
			}

			return {
				"dataChannel": dch,
				"position": _i
			};
		}
	}], [{
		key: 'get_DataChannel',
		value: function get_DataChannel(config) {

			var dataChannel = null;

			switch (config.type) {
				case DataChannel_CONSTANTS.Config.DCtype_socketio:
					var DC_SocketIO = require('./DC_SocketIO.js');
					dataChannel = new DC_SocketIO(config);
					break;

				default:
					break;
			}

			return dataChannel;
		}

		/**
   * Returns Messages searched by Message.typeExtra
   */

	}, {
		key: 'getMessagesByTypeExtra',
		value: function getMessagesByTypeExtra(typeExtra, msgList) {

			var messages = msgList.filter(function (msg, _i, _items) {

				if (msg.typeExtra == typeExtra) {
					return true;
				}
			});

			return {
				"numMessages": messages.length,
				"messages": messages
			};
		}
	}]);

	return DataChannelsManager;
}();

var dataChannel_Lib = {
	"CONSTANTS": DataChannel_CONSTANTS,
	"DataChannel": DataChannel,
	"DataMessage": DataMessage,
	"DataChannelsManager": DataChannelsManager
};

module.exports = dataChannel_Lib;
//# sourceMappingURL=DataChannel.js.map
