"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var EventEmitter = require('events').EventEmitter;
var DataChannel = require('./DataChannel.js').DataChannel;

/**
 * Data Channel for Socket.io type
 */

var DC_SocketIO = function (_DataChannel) {
	_inherits(DC_SocketIO, _DataChannel);

	function DC_SocketIO(config) {
		_classCallCheck(this, DC_SocketIO);

		return _possibleConstructorReturn(this, Object.getPrototypeOf(DC_SocketIO).call(this, config));
	}

	/**
  * Initialize data channel
  */


	_createClass(DC_SocketIO, [{
		key: 'initDataChannel',
		value: function initDataChannel() {
			_get(Object.getPrototypeOf(DC_SocketIO.prototype), 'initDataChannel', this).call(this);

			switch (this.config.mode) {
				case this.CONSTANTS.Config.modeIN:
					this.initDC_modeIN();
					break;
				case this.CONSTANTS.Config.modeOUT:
					this.initDC_modeOUT();
					break;
				default:
					break;
			}
		}

		/**
   * Initialize mode IN
   */

	}, {
		key: 'initDC_modeIN',
		value: function initDC_modeIN() {

			if (this.server != null) {
				throw "Server is initialized";
			}

			var dataChannel = this;

			// Map event: Channel stop
			dataChannel.eventEmitter.on(dataChannel.CONSTANTS.Events.ChannelStop, function () {
				dataChannel.server.close();
				dataChannel.state = dataChannel.CONSTANTS.States.DCstate_Stop;
				dataChannel.eventEmitter.emit(dataChannel.CONSTANTS.Events.ChannelStopped);
			});

			// Map event: Channel start
			dataChannel.eventEmitter.on(dataChannel.CONSTANTS.Events.ChannelStart, function () {
				dataChannel.server.listen(this.config.socketPort); // listen on Socket port
				dataChannel.eventEmitter.emit(dataChannel.CONSTANTS.Events.ChannelStarted);
			});

			this.server = require('socket.io')();

			this.server.on('connection', function (socket) {
				// Map connection of Socket

				dataChannel.eventEmitter.emit(dataChannel.CONSTANTS.Events.ClientConnected, { "socket": socket });

				socket.on('disconnect', function () {
					// Map disconnection of Socket
					dataChannel.eventEmitter.emit(dataChannel.CONSTANTS.Events.ClientDisconnected, { "socket": socket });
				});

				socket.on(dataChannel.CONSTANTS.Messages.DataMessage, function (msg) {
					// Map message of Socket
					dataChannel.eventEmitter.emit(dataChannel.CONSTANTS.Events.MessageReceived, msg);
				});
			});

			dataChannel.eventEmitter.emit(dataChannel.CONSTANTS.Events.ChannelInitialized); // Emit event: Channel initialized
		}

		/**
   * Initialize mode OUT
   */

	}, {
		key: 'initDC_modeOUT',
		value: function initDC_modeOUT() {
			if (this.socket != null) {
				throw "Socket is initialized";
			}

			var dataChannel = this;
			dataChannel._serverURL = 'http://' + dataChannel.config.netLocation + ':' + dataChannel.config.socketPort;

			// Map event: Channel start
			dataChannel.eventEmitter.on(dataChannel.CONSTANTS.Events.ChannelStart, function () {

				ddataChannel.socket = require('socket.io-client')(dataChannel._serverURL); // connect to server

				ddataChannel.socket.on('connect', function () {
					// Map connection to Server
					dataChannel.eventEmitter.emit(dataChannel.CONSTANTS.Events.ChannelStarted);
				});

				ddataChannel.socket.on('disconnect', function () {
					// Map disconnection from Server
					dataChannel.eventEmitter.emit(dataChannel.CONSTANTS.Events.ChannelStop);
				});
			});

			ddataChannel.eventEmitter.on(dataChannel.CONSTANTS.Events.MainLoop_Tick, function () {
				// Map main loop tick
				dataChannel.socket.emit(dataChannel.CONSTANTS.Messages.DataMessage, dataChannel.messagesList);
				dataChannel.messagesList = [];
			});

			this.state = this.CONSTANTS.States.DCstate_Ready; // Change state to Ready
			this.eventEmitter.emit(this.CONSTANTS.Events.ChannelInitialized); // Emit event: Channel initialized
		}
	}]);

	return DC_SocketIO;
}(DataChannel);

module.exports = DC_SocketIO;
//# sourceMappingURL=DC_SocketIO.js.map
