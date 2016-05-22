"use strict";

/**
 * DC_SocketIO library
 * 
 * Provides data channel to ST network based on socket.io
 * 
 * 
 */

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

			var dc = this;

			_get(Object.getPrototypeOf(DC_SocketIO.prototype), 'initDataChannel', this).call(this);

			switch (dc.config.mode) {
				case dc.CONSTANTS.Config.modeIN:
					dc.initDC_modeIN();
					break;
				case dc.CONSTANTS.Config.modeOUT:
					dc.initDC_modeOUT();
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

			var dc = this;

			if (dc.server != null) {
				throw "Server is initialized";
			}

			// Map event: Channel stop
			dc.eventEmitter.on(dc.CONSTANTS.Events.ChannelStop, function () {
				dc.server.close();
				dc.state = dc.CONSTANTS.States.DCstate_Stop;
				dc.eventEmitter.emit(dc.CONSTANTS.Events.ChannelStopped);
			});

			// Map event: Channel start
			dc.eventEmitter.on(dc.CONSTANTS.Events.ChannelStart, function () {
				dc.server.listen(dc.config.socketPort); // listen on Socket port
				dc.eventEmitter.emit(dc.CONSTANTS.Events.ChannelStarted);
			});

			dc.server = require('socket.io')();

			// Map connection of Socket
			dc.server.on('connection', function (socket) {

				dc.eventEmitter.emit(dc.CONSTANTS.Events.ClientConnected, { "socket": socket }); // Emit event ClientConnected

				// Map disconnection of Socket
				socket.on('disconnect', function () {
					dc.eventEmitter.emit(dc.CONSTANTS.Events.ClientDisconnected, { "socket": socket }); // Emit event ClientDisconnected
				});

				// Map message of Socket
				socket.on(dc.CONSTANTS.Messages.DataMessage, function (msg) {
					dc.eventEmitter.emit(dc.CONSTANTS.Events.MessageReceived, msg); // Emit event MessageReceived
				});
			});

			dc.eventEmitter.on(dc.CONSTANTS.Events.MainLoop_Tick, function () {
				// Map event MainLoop_Tick
				dc.socket.emit(dc.CONSTANTS.Messages.DataMessage, dc.messagesList); // Emit messages to socket
				dc.messagesList = [];
			});

			dc.eventEmitter.emit(dc.CONSTANTS.Events.ChannelInitialized); // Emit event Channel initialized
		}

		/**
   * Initialize mode OUT
   */

	}, {
		key: 'initDC_modeOUT',
		value: function initDC_modeOUT() {

			var dc = this;

			if (dc.socket != null) {
				throw "Socket is initialized";
			}

			dc._serverURL = 'http://' + dc.config.netLocation + ':' + dc.config.socketPort;

			// Map event: Channel stop
			dc.eventEmitter.on(dc.CONSTANTS.Events.ChannelStop, function () {
				dc.socket.close();
				dc.state = dc.CONSTANTS.States.DCstate_Stop;
				dc.eventEmitter.emit(dc.CONSTANTS.Events.ChannelStopped);
			});

			// Map event ChannelStart
			dc.eventEmitter.on(dc.CONSTANTS.Events.ChannelStart, function () {

				dc.socket = require('socket.io-client')(dc._serverURL); // connect to server

				// Map event connect
				dc.socket.on('connect', function () {
					dc.eventEmitter.emit(dc.CONSTANTS.Events.ChannelStarted); // Emit event ChannelStarted
				});

				// Map event disconnect
				dc.socket.on('disconnect', function () {
					dc.eventEmitter.emit(dc.CONSTANTS.Events.ChannelStop); // Emit event ChannelStop
				});

				// Map message of Socket
				dc.socket.on(dc.CONSTANTS.Messages.DataMessage, function (msg) {
					dc.eventEmitter.emit(dc.CONSTANTS.Events.MessageReceived, msg); // Emit event MessageReceived
				});
			});

			// Map event MainLoop_Tick
			dc.eventEmitter.on(dc.CONSTANTS.Events.MainLoop_Tick, function () {
				dc.socket.emit(dc.CONSTANTS.Messages.DataMessage, dc.messagesList); // Emit messages to socket
				dc.messagesList = [];
			});

			dc.state = dc.CONSTANTS.States.DCstate_Ready; // Change state to Ready
			dc.eventEmitter.emit(dc.CONSTANTS.Events.ChannelInitialized); // Emit event: Channel initialized
		}
	}]);

	return DC_SocketIO;
}(DataChannel);

module.exports = DC_SocketIO;
//# sourceMappingURL=DC_SocketIO.js.map
