// vim: ts=4 sw=4 sts=0 noet

var setting = require("./setting");

// create websokect client
var ws = require("ws");
ws = new ws('ws://127.0.0.1:18080');




ws.on('open', function() {
	console.log('connected.');
	ws.send(JSON.stringify({
		packetType: setting.packet.system,
		dataType: setting.system.client_auth,
		message: {
			role: setting.system.role.player
		}
	}));
});

ws.on('message', function(data) {
	console.log("received:", JSON.parse(data));
});

