"use strict";

/**
 * COMSystem library
 * 
 * Provides communications system to ST network
 * 
 * 
 * v. Morse
 */

/**
 * Bind Service
 */

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TBind_Morse_Service = function () {
	function TBind_Morse_Service(comSYS, tBind) {
		_classCallCheck(this, TBind_Morse_Service);

		this.comSYS = comSYS;
		this.tBind = tBind;
		this.CONSTANTS = comSYS.CONSTANTS;
	}

	_createClass(TBind_Morse_Service, [{
		key: "initialize",
		value: function initialize() {

			var service = this;
			service.mapControlEvents();
		}

		/**
   * Map control events
   */

	}, {
		key: "mapControlEvents",
		value: function mapControlEvents() {

			var service = this;
			var tBind = service.tBind;

			var comSYS = service.comSYS;
			var _config = comSYS.config;

			var socket = _config.controlChannel.socket;

			// Map event Unbind
			tBind.eventEmitter.on(tBind.CONSTANTS.Events.Unbind, service._event_Unbind);

			// Map event Bind_Started
			tBind.eventEmitter.on(tBind.CONSTANTS.Events.Bind_Started, service._event_Bind_Started);
		}

		/**
   * Event Bind_Started
   */

	}, {
		key: "_event_Bind_Started",
		value: function _event_Bind_Started(data) {

			var service = this;
			var tBind = service.tBind;

			var comSYS = service.comSYS;
			var _config = comSYS.config;

			var socket = _config.controlChannel.socket;

			var synchro = data.synchro;
			var options = data.options;
		}

		/**
   * Event Unbind
   */

	}, {
		key: "_event_Unbind",
		value: function _event_Unbind(data) {}
	}]);

	return TBind_Morse_Service;
}();

/**
 * Bind Service
 * Role Node
 */


var TBind_Morse_Srv_Node = function (_TBind_Morse_Service) {
	_inherits(TBind_Morse_Srv_Node, _TBind_Morse_Service);

	function TBind_Morse_Srv_Node(comSYS, tBind) {
		_classCallCheck(this, TBind_Morse_Srv_Node);

		return _possibleConstructorReturn(this, Object.getPrototypeOf(TBind_Morse_Srv_Node).call(this, comSYS, tBind));
	}

	/**
  * Event Unbind
  */


	_createClass(TBind_Morse_Srv_Node, [{
		key: "_event_Unbind",
		value: function _event_Unbind(data) {

			var service = this;
			var tBind = service.tBind;

			var comSYS = service.comSYS;
			var _config = comSYS.config;

			var socket = _config.controlChannel.socket;

			var synchro = data.synchro;
			var options = data.options;

			if (synchro) {

				// Send Message BindFree
				socket.emit(comSYS.CONSTANTS.Messages.BindFree, {
					"bindID": tBind.bindID,
					"type": tBind.type
				});
			}
		}
	}]);

	return TBind_Morse_Srv_Node;
}(TBind_Morse_Service);

/**
 * Bind Service
 * Role Server
 */


var TBind_Morse_Srv_Server = function (_TBind_Morse_Service2) {
	_inherits(TBind_Morse_Srv_Server, _TBind_Morse_Service2);

	function TBind_Morse_Srv_Server(comSYS, tBind) {
		_classCallCheck(this, TBind_Morse_Srv_Server);

		return _possibleConstructorReturn(this, Object.getPrototypeOf(TBind_Morse_Srv_Server).call(this, comSYS, tBind));
	}

	/**
  * Event Unbind
  */


	_createClass(TBind_Morse_Srv_Server, [{
		key: "_event_Unbind",
		value: function _event_Unbind(data) {

			var service = this;
			var tBind = service.tBind;

			var comSYS = service.comSYS;
			var _config = comSYS.config;

			var socket = _config.controlChannel.socket;

			var synchro = data.synchro;
			var options = data.options;

			if (synchro) {

				// Send Message UnBind
				socket.emit(comSYS.CONSTANTS.Messages.UnBind, {
					"bindID": options.bindID
				});
			}
		}
	}]);

	return TBind_Morse_Srv_Server;
}(TBind_Morse_Service);

/**
 * Communications System Service
 */


var COMSys_Morse_Service = function () {
	function COMSys_Morse_Service(comSYS) {
		_classCallCheck(this, COMSys_Morse_Service);

		this.comSYS = comSYS;
		this.CONSTANTS = comSYS.CONSTANTS;
	}

	_createClass(COMSys_Morse_Service, [{
		key: "initialize",
		value: function initialize() {

			var service = this;
			service.mapControlEvents();
			service.mapControlMessages();
		}

		/**
   * Map control events
   */

	}, {
		key: "mapControlEvents",
		value: function mapControlEvents(socket) {

			var service = this;

			var comSYS = service.comSYS;
			var _config = comSYS.config;

			if (socket == undefined) {
				socket = _config.controlChannel.socket;
			}

			// Map event Bind_Added
			comSYS.eventEmitter.on(comSYS.CONSTANTS.Events.Bind_Added, service._event_Bind_Added);
		}

		/**
   * Map control messages
   */

	}, {
		key: "mapControlMessages",
		value: function mapControlMessages() {

			var service = this;

			var comSYS = service.comSYS;
			var _config = comSYS.config;

			if (socket == undefined) {
				socket = _config.controlChannel.socket;
			}

			// Map message getBindList
			socket.on(comSYS.CONSTANTS.Messages.getBindList, function (msg) {
				service._msg_getBindList(msg, socket, {
					"filter": msg.filter
				});
			});

			// Map message ErrorInfo
			socket.on(comSYS.CONSTANTS.Messages.ErrorInfo, function (msg) {
				service._msg_ErrorInfo(msg, socket, {
					"msgError": msg
				});
			});
		}

		/**
   * Send ErrorInfo message
   */

	}, {
		key: "sendErrorInfo",
		value: function sendErrorInfo(socket, context, msg, data) {

			var service = this;

			var comSYS = service.comSYS;
			var _config = comSYS.config;

			//		let socket = _config.controlChannel.socket;

			var message = {
				"context": context,
				"msg": msg,
				"data": data
			};

			socket.emit(service.CONSTANTS.Messages.ErrorInfo, message); // Emit message BindList
		}

		/**
   * Event Bind_Added
   */

	}, {
		key: "_event_Bind_Added",
		value: function _event_Bind_Added(data) {}

		/**
   * Message ErrorInfo
   */

	}, {
		key: "_msg_ErrorInfo",
		value: function _msg_ErrorInfo(msg, socket, options) {

			console.log('<*> ST COMSys_Morse_Service._msg_ErrorInfo'); // TODO REMOVE DEBUG LOG
			console.log(msg);
		}

		/**
   * Message getBindList
   */

	}, {
		key: "_msg_getBindList",
		value: function _msg_getBindList(msg, socket, options) {

			var service = this;

			var comSYS = service.comSYS;
			var _config = comSYS.config;

			console.log('<*> ST COMSys_Morse_Service._msg_getBindList'); // TODO REMOVE DEBUG LOG

			var message = {
				"bindsList": [],
				"binds": comSYS.thingsBindings.length
			};

			comSYS.thingsBindings.forEach(function (_bind, _i) {

				var bindInfo = {
					"bindID": _bind.bindID,
					"type": _bind.type,
					"state": _bind.state
				};

				message.bindsList.push(bindInfo);
			});

			socket.emit(service.CONSTANTS.Messages.BindList, message); // Emit message BindList
		}
	}]);

	return COMSys_Morse_Service;
}();

/**
 * Communications System Service
 * Role Node
 */


var COMSys_Morse_Srv_Node = function (_COMSys_Morse_Service) {
	_inherits(COMSys_Morse_Srv_Node, _COMSys_Morse_Service);

	function COMSys_Morse_Srv_Node(comSYS) {
		_classCallCheck(this, COMSys_Morse_Srv_Node);

		return _possibleConstructorReturn(this, Object.getPrototypeOf(COMSys_Morse_Srv_Node).call(this, comSYS));
	}

	/**
  * Map control messages
  */


	_createClass(COMSys_Morse_Srv_Node, [{
		key: "mapControlMessages",
		value: function mapControlMessages(socket) {

			_get(Object.getPrototypeOf(COMSys_Morse_Srv_Node.prototype), "mapControlMessages", this).call(this, socket);

			var service = this;

			var comSYS = service.comSYS;
			var _config = comSYS.config;

			if (socket == undefined) {
				socket = _config.controlChannel.socket;
			}

			// Map message createBind
			socket.on(comSYS.CONSTANTS.Messages.createBind, function (msg) {
				service._msg_createBind(msg, socket, {
					"bindID": msg.bindID,
					"type": msg.type,
					"source": msg.source,
					"target": msg.target

				});
			});
		}

		/**
   * Event Bind_Added
   */

	}, {
		key: "_event_Bind_Added",
		value: function _event_Bind_Added(data) {

			var service = this;

			var comSYS = service.comSYS;
			var _config = comSYS.config;

			var socket = _config.controlChannel.socket;

			var synchro = data.synchro;
			var bind = data.bind;
			var options = data.options;

			if (synchro) {

				// Send Message Bind_Created
				socket.emit(comSYS.CONSTANTS.Messages.Bind_Created, {
					"bindID": bind.bindID,
					"type": bind.type
				});
			}
		}

		/**
   * Message createBind
   */

	}, {
		key: "_msg_createBind",
		value: function _msg_createBind(msg, socket, options) {

			var service = this;

			var comSYS = service.comSYS;
			var _config = comSYS.config;

			var type = options.type;
			var source = options.source;
			var target = options.target;
			var _options = {
				"bindID": options.bindID
			};

			console.log('<*> ST COMSys_Morse_Service._msg_createBind'); // TODO REMOVE DEBUG LOG

			var tbind = new TBind_Morse(type, source, target, _options);

			try {
				tbind.initialize();
				comSYS.addBind(tbind);
			} catch (e) {
				console.log('<EEE> ST COMSys_Morse_Service._msg_createBind'); // TODO REMOVE DEBUG LOG
				console.log(e); // TODO REMOVE DEBUG LOG

				// Notify Error
				service.sendErrorInfo(socket, "Net.Bind", e, {
					"controlMSG": comSYS.CONSTANTS.Messages.createBind,
					"msg": msg,
					"options": options
				});
			}
		}
	}]);

	return COMSys_Morse_Srv_Node;
}(COMSys_Morse_Service);

/**
 * Communications System Service
 * Role Server
 */


var COMSys_Morse_Srv_Server = function (_COMSys_Morse_Service2) {
	_inherits(COMSys_Morse_Srv_Server, _COMSys_Morse_Service2);

	function COMSys_Morse_Srv_Server(comSYS) {
		_classCallCheck(this, COMSys_Morse_Srv_Server);

		return _possibleConstructorReturn(this, Object.getPrototypeOf(COMSys_Morse_Srv_Server).call(this, comSYS));
	}

	/**
  * Map control messages
  */


	_createClass(COMSys_Morse_Srv_Server, [{
		key: "mapControlMessages",
		value: function mapControlMessages(socket) {

			_get(Object.getPrototypeOf(COMSys_Morse_Srv_Server.prototype), "mapControlMessages", this).call(this, socket);
		}

		/**
   * Event Bind_Added
   */

	}, {
		key: "_event_Bind_Added",
		value: function _event_Bind_Added(data) {

			var service = this;

			var comSYS = service.comSYS;
			var _config = comSYS.config;

			var socket = _config.controlChannel.socket;

			var synchro = data.synchro;
			var bind = data.bind;
			var options = data.options;

			if (synchro) {

				// Send Message createBind
				socket.emit(comSYS.CONSTANTS.Messages.createBind, {
					"bindID": options.bindID,
					"type": options.type,
					"source": options.source,
					"target": options.target
				});
			}
		}
	}]);

	return COMSys_Morse_Srv_Server;
}(COMSys_Morse_Service);

var cysMorseSrv_Lib = {
	"TBind_Morse_Service": TBind_Morse_Service,
	"TBind_Morse_Srv_Node": TBind_Morse_Srv_Node,
	"TBind_Morse_Srv_Server": TBind_Morse_Srv_Server,
	"COMSys_Morse_Service": COMSys_Morse_Service,
	"COMSys_Morse_Srv_Node": COMSys_Morse_Srv_Node,
	"COMSys_Morse_Srv_Server": COMSys_Morse_Srv_Server
};

module.exports = cysMorseSrv_Lib;
//# sourceMappingURL=csysMorse_Services.js.map
