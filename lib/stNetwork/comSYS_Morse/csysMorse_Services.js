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
class TBind_Morse_Service {
	
	constructor(comSYS, tBind) {
		
		this.comSYS = comSYS;
		this.tBind = tBind;
		this.CONSTANTS = comSYS.CONSTANTS;
	}
	
	
	initialize() {
		
		let service = this;
		service.mapControlEvents();
	}
	
	
	/**
	 * Map control events
	 */
	mapControlEvents() {
		
		let service = this;
		let tBind = service.tBind;
		
		let comSYS = service.comSYS;
		let _config = comSYS.config;
		
		let socket = _config.controlChannel.socket;
		
		// Map event Unbind
		tBind.eventEmitter.on(tBind.CONSTANTS.Events.Unbind, service._event_Unbind);
		
		// Map event Bind_Started
		tBind.eventEmitter.on(tBind.CONSTANTS.Events.Bind_Started, service._event_Bind_Started);
	}
	
	
	/**
	 * Event Bind_Started
	 */
	_event_Bind_Started(data) {
		
		let service = this;
		let tBind = service.tBind;
		
		let comSYS = service.comSYS;
		let _config = comSYS.config;
		
		let socket = _config.controlChannel.socket;
		
		let synchro = data.synchro;
		let options = data.options;
		
	}
	
	
	/**
	 * Event Unbind
	 */
	_event_Unbind(data) {	
		
	}
	
}


/**
 * Bind Service
 * Role Node
 */
class TBind_Morse_Srv_Node extends TBind_Morse_Service {
	
	constructor(comSYS, tBind) {
		
		super(comSYS, tBind);
	}
	
	
	/**
	 * Event Unbind
	 */
	_event_Unbind(data) {
		
		let service = this;
		let tBind = service.tBind;
		
		let comSYS = service.comSYS;
		let _config = comSYS.config;
		
		let socket = _config.controlChannel.socket;
		
		let synchro = data.synchro;
		let options = data.options;
		
		
		if (synchro) {
			
			// Send Message BindFree
			socket.emit(comSYS.CONSTANTS.Messages.BindFree, 
				{
					"bindID" : tBind.bindID,
					"type" : tBind.type
				}
			);
		}
		
	}
	
	
}


/**
 * Bind Service
 * Role Server
 */
class TBind_Morse_Srv_Server extends TBind_Morse_Service {
	
	constructor(comSYS, tBind) {
		
		super(comSYS, tBind);
	}
	
	
	/**
	 * Event Unbind
	 */
	_event_Unbind(data) {
		
		let service = this;
		let tBind = service.tBind;
		
		let comSYS = service.comSYS;
		let _config = comSYS.config;
		
		let socket = _config.controlChannel.socket;
		
		let synchro = data.synchro;
		let options = data.options;
		
		if (synchro) {
			
			// Send Message UnBind
			socket.emit(comSYS.CONSTANTS.Messages.UnBind, 
				{
					"bindID" : options.bindID
				}
			);
		}
		
	}
	
	
}





/**
 * Communications System Service
 */
class COMSys_Morse_Service {
	
	constructor(comSYS) {
		
		this.comSYS = comSYS;
		this.CONSTANTS = comSYS.CONSTANTS;
	}
	
	
	initialize() {
		
		let service = this;
		service.mapControlEvents();
		service.mapControlMessages();
	}
	
	
	/**
	 * Map control events
	 */
	mapControlEvents(socket) {
		
		let service = this;
		
		let comSYS = service.comSYS;
		let _config = comSYS.config;
		
		
		if (socket == undefined) {
			socket = _config.controlChannel.socket;
		}
		
		// Map event Bind_Added
		comSYS.eventEmitter.on(comSYS.CONSTANTS.Events.Bind_Added, service._event_Bind_Added);
		
	}
	
	
	/**
	 * Map control messages
	 */
	mapControlMessages() {
		
		let service = this;
		
		let comSYS = service.comSYS;
		let _config = comSYS.config;
		
		if (socket == undefined) {
			socket = _config.controlChannel.socket;
		}
		
		
		// Map message getBindList
		socket.on(comSYS.CONSTANTS.Messages.getBindList, function(msg){
			service._msg_getBindList(msg, socket, {
				"filter" : msg.filter
			});
		  });
		
		
		// Map message ErrorInfo
		socket.on(comSYS.CONSTANTS.Messages.ErrorInfo, function(msg){
			service._msg_ErrorInfo(msg, socket, {
				"msgError" : msg
			});
		  });
		
	}
	
	
	/**
	 * Send ErrorInfo message
	 */
	sendErrorInfo(socket, context, msg, data) {
		
		let service = this;
		
		let comSYS = service.comSYS;
		let _config = comSYS.config;
		
//		let socket = _config.controlChannel.socket;
		
			
		let message = {
			"context" : context,
			"msg": msg,
			"data": data
		}
		
		socket.emit(service.CONSTANTS.Messages.ErrorInfo, message);	// Emit message BindList
		
	}
	
	
	/**
	 * Event Bind_Added
	 */
	_event_Bind_Added(data) {
		
	}
	
	
	/**
	 * Message ErrorInfo
	 */
	_msg_ErrorInfo(msg, socket, options) {
		
		console.log('<*> ST COMSys_Morse_Service._msg_ErrorInfo');	// TODO REMOVE DEBUG LOG
		console.log(msg);
		
	}
	
	
	/**
	 * Message getBindList
	 */
	_msg_getBindList(msg, socket, options) {
		
		let service = this;
		
		let comSYS = service.comSYS;
		let _config = comSYS.config;
		
		console.log('<*> ST COMSys_Morse_Service._msg_getBindList');	// TODO REMOVE DEBUG LOG
		
		let message = {
			"bindsList": [],
			"binds" : comSYS.thingsBindings.length
		}
		
		comSYS.thingsBindings.forEach(function(_bind, _i) {
			
			let bindInfo = {
				"bindID" : 	_bind.bindID,
				"type" : _bind.type,
				"state" : _bind.state
			};
			
			message.bindsList.push(bindInfo);
		});
		
		socket.emit(service.CONSTANTS.Messages.BindList, message);	// Emit message BindList
		
	}
	
}


/**
 * Communications System Service
 * Role Node
 */
class COMSys_Morse_Srv_Node extends COMSys_Morse_Service {
	
	constructor(comSYS) {
		
		super(comSYS);
	}
	
	
	/**
	 * Map control messages
	 */
	mapControlMessages(socket) {
		
		super.mapControlMessages(socket);
		
		
		let service = this;
		
		let comSYS = service.comSYS;
		let _config = comSYS.config;
		
		if (socket == undefined) {
			socket = _config.controlChannel.socket;
		}

		
		// Map message createBind
		socket.on(comSYS.CONSTANTS.Messages.createBind, function(msg){
			service._msg_createBind(msg, socket, {
				"bindID" : msg.bindID,
				"type" : msg.type,
				"source" :  msg.source,
				"target" :  msg.target
				
			});
		  });
	}
	
	
	/**
	 * Event Bind_Added
	 */
	_event_Bind_Added(data) {
		
		let service = this;
		
		let comSYS = service.comSYS;
		let _config = comSYS.config;
		
		let socket = _config.controlChannel.socket;
		
		let synchro = data.synchro;
		let bind = data.bind;
		let options = data.options;
		
		
		if (synchro) {
			
			// Send Message Bind_Created
			socket.emit(comSYS.CONSTANTS.Messages.Bind_Created, 
				{
					"bindID" : bind.bindID,
					"type" : bind.type
				}
			);
		}
		
	}
	
	
	/**
	 * Message createBind
	 */
	_msg_createBind(msg, socket, options) {
		
		let service = this;
		
		let comSYS = service.comSYS;
		let _config = comSYS.config;
		
		let type = options.type;
		let source = options.source;
		let target = options.target;
		let _options = {
			"bindID" : options.bindID
		};

		console.log('<*> ST COMSys_Morse_Service._msg_createBind');	// TODO REMOVE DEBUG LOG

		let tbind = new TBind_Morse(type, source, target, _options);
		
		try {
			tbind.initialize();
			comSYS.addBind(tbind);
		} catch (e) {
			console.log('<EEE> ST COMSys_Morse_Service._msg_createBind');	// TODO REMOVE DEBUG LOG
			console.log(e);	// TODO REMOVE DEBUG LOG
			
			// Notify Error
			service.sendErrorInfo( socket, "Net.Bind", e, 
				{ 
					"controlMSG": comSYS.CONSTANTS.Messages.createBind, 
					"msg": msg, 
					"options": options 
				}
			);
			
		}
		
	}
	
}


/**
 * Communications System Service
 * Role Server
 */
class COMSys_Morse_Srv_Server extends COMSys_Morse_Service {
	
	constructor(comSYS) {
		
		super(comSYS);
	}
	
	
	/**
	 * Map control messages
	 */
	mapControlMessages(socket) {
		
		super.mapControlMessages(socket);
	}
	
	
	/**
	 * Event Bind_Added
	 */
	_event_Bind_Added(data) {
		
		let service = this;
		
		let comSYS = service.comSYS;
		let _config = comSYS.config;
		
		let socket = _config.controlChannel.socket;
		
		let synchro = data.synchro;
		let bind = data.bind;
		let options = data.options;
		
		if (synchro) {
			
			// Send Message createBind
			socket.emit(comSYS.CONSTANTS.Messages.createBind, 
				{
					"bindID" : options.bindID,
					"type" : options.type,
					"source" : options.source,
					"target" : options.target
				}
			);
		}
		
	}
	
}


let cysMorseSrv_Lib = {
	"TBind_Morse_Service" : TBind_Morse_Service,
	"TBind_Morse_Srv_Node" : TBind_Morse_Srv_Node,
	"TBind_Morse_Srv_Server" : TBind_Morse_Srv_Server,
	"COMSys_Morse_Service" : COMSys_Morse_Service,
	"COMSys_Morse_Srv_Node" : COMSys_Morse_Srv_Node,
	"COMSys_Morse_Srv_Server" : COMSys_Morse_Srv_Server
}


module.exports = cysMorseSrv_Lib;

