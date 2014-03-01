// vim: ts=4 sw=4 sts=0 noet

var setting = require("./setting");
var process = require("./process");

// create websokect server
var wss = require("ws").Server;
wss = new wss({ port: 18080 });




wss.on('connection', function(ws) {
	ws.on('message', function(msg) {
		// get json object from msg
		var pkt;
		try {
			pkt = JSON.parse(msg);
		}
		catch (e) {
			console.log(e);
			ws.send(JSON.stringify({
				packetType: setting.packet.system,
				dataType: setting.system.invalid
			}));
			ws.close();
			return;
		}

		console.log(pkt);

		switch (pkt.packetType) {
			case setting.packet.system: process.system(wss, ws, pkt); break;
			case setting.packet.game  : process.  game(wss, ws, pkt); break;
			default:
				ws.send(JSON.stringify({
					packetType: setting.packet.system,
					dataType: setting.system.invalid
				}));
				ws.close();
				return;
		}
	});
});

